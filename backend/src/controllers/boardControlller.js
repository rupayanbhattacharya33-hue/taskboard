const Board = require('../models/Board');

// ── Get all boards for logged in user ────────────────────────
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate('owner', 'name email').sort({ createdAt: -1 });

    res.json({ boards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get single board ─────────────────────────────────────────
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    const hasAccess =
      board.owner._id.toString() === req.user._id.toString() ||
      board.members.some(m => m._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create board ─────────────────────────────────────────────
const createBoard = async (req, res) => {
  try {
    const { title, description, color } = req.body;

    const board = await Board.create({
      title,
      description,
      color,
      owner: req.user._id,
      members: [],
    });

    res.status(201).json({ message: 'Board created', board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update board ─────────────────────────────────────────────
const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Only owner can update
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can update this board' });
    }

    const { title, description, color } = req.body;
    board.title = title || board.title;
    board.description = description || board.description;
    board.color = color || board.color;

    await board.save();

    res.json({ message: 'Board updated', board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete board ─────────────────────────────────────────────
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Only owner can delete
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this board' });
    }

    await board.deleteOne();

    res.json({ message: 'Board deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBoards, getBoard, createBoard, updateBoard, deleteBoard };