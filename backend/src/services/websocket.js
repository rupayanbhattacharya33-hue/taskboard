const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');

// Store connected clients: { boardId: Set of ws clients }
const rooms = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection');

    ws.isAlive = true;
    ws.boardId = null;
    ws.userId = null;

    // ── Handle incoming messages ───────────────────────────
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        // Join a board room
        if (message.type === 'JOIN_BOARD') {
          handleJoinBoard(ws, message);
        }

        // Leave a board room
        if (message.type === 'LEAVE_BOARD') {
          handleLeaveBoard(ws);
        }

      } catch (err) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
      }
    });

    // ── Handle disconnect ──────────────────────────────────
    ws.on('close', () => {
      handleLeaveBoard(ws);
      console.log('❌ WebSocket disconnected');
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'WebSocket connected!' }));
  });

  // ── Heartbeat to keep connections alive ─────────────────
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  console.log('🔌 WebSocket server ready');
  return wss;
};

// ── Join a board room ──────────────────────────────────────
const handleJoinBoard = (ws, message) => {
  const { boardId, token } = message;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.userId = decoded.id;
    ws.boardId = boardId;

    // Add to room
    if (!rooms.has(boardId)) {
      rooms.set(boardId, new Set());
    }
    rooms.get(boardId).add(ws);

    ws.send(JSON.stringify({
      type: 'JOINED_BOARD',
      boardId,
      message: `Joined board ${boardId}`,
    }));

    console.log(`👤 User ${ws.userId} joined board ${boardId}`);
  } catch (err) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid token' }));
  }
};

// ── Leave a board room ─────────────────────────────────────
const handleLeaveBoard = (ws) => {
  if (ws.boardId && rooms.has(ws.boardId)) {
    rooms.get(ws.boardId).delete(ws);
    if (rooms.get(ws.boardId).size === 0) {
      rooms.delete(ws.boardId);
    }
    console.log(`👤 User ${ws.userId} left board ${ws.boardId}`);
  }
};

// ── Broadcast to all users in a board room ─────────────────
const broadcastToBoard = (boardId, event) => {
  if (!rooms.has(boardId)) return;

  const message = JSON.stringify(event);
  rooms.get(boardId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

module.exports = { setupWebSocket, broadcastToBoard };