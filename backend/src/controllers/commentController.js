const Comment = require('../models/Comment');
const Task = require('../models/Task');

// ── Get all comments for a task ──────────────────────────────
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create comment ───────────────────────────────────────────
const createComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      text: req.body.text,
      task: req.params.taskId,
      author: req.user._id,
    });

    const populated = await comment.populate('author', 'name email');

    res.status(201).json({ message: 'Comment added', comment: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete comment ───────────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getComments, createComment, deleteComment };