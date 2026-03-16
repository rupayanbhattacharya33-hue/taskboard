const Task = require('../models/Task');
const Board = require('../models/Board');
const { broadcastToBoard } = require('../services/websocket');
const { triggerWebhooks } = require('../services/webhookService');

// ── Get all tasks for a board ────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create task ──────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

  const { title, description, status, priority, assignee, dueDate, attachments } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      attachments: attachments || [],
      board: req.params.boardId,
      createdBy: req.user._id,
    });

    // 🔴 Broadcast real-time update
    broadcastToBoard(req.params.boardId, {
      type: 'TASK_CREATED',
      task,
    });

    // 🔔 Trigger webhooks
    await triggerWebhooks(req.params.boardId, 'TASK_CREATED', task);

    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update task ──────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, assignee, dueDate, order } = req.body;

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignee = assignee !== undefined ? assignee : task.assignee;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.order = order !== undefined ? order : task.order;

    await task.save();

    // 🔴 Broadcast real-time update
    broadcastToBoard(task.board.toString(), {
      type: 'TASK_UPDATED',
      task,
    });

    // 🔔 Trigger webhooks
    await triggerWebhooks(task.board.toString(), 'TASK_UPDATED', task);

    res.json({ message: 'Task updated', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete task ──────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const boardId = task.board.toString();
    await task.deleteOne();

    // 🔴 Broadcast real-time update
    broadcastToBoard(boardId, {
      type: 'TASK_DELETED',
      taskId: req.params.id,
    });

    // 🔔 Trigger webhooks
    await triggerWebhooks(boardId, 'TASK_DELETED', { taskId: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };