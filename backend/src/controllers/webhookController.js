const Webhook = require('../models/Webhook');

// ── Get all webhooks for a board ─────────────────────────────
const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({
      board: req.params.boardId,
      owner: req.user._id,
    });
    res.json({ webhooks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create webhook ───────────────────────────────────────────
const createWebhook = async (req, res) => {
  try {
    const { url, events, secret } = req.body;

    const webhook = await Webhook.create({
      url,
      events,
      secret,
      board: req.params.boardId,
      owner: req.user._id,
    });

    res.status(201).json({ message: 'Webhook created', webhook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update webhook ───────────────────────────────────────────
const updateWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    if (webhook.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { url, events, secret, isActive } = req.body;
    webhook.url = url || webhook.url;
    webhook.events = events || webhook.events;
    webhook.secret = secret || webhook.secret;
    webhook.isActive = isActive !== undefined ? isActive : webhook.isActive;

    await webhook.save();
    res.json({ message: 'Webhook updated', webhook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete webhook ───────────────────────────────────────────
const deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    if (webhook.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await webhook.deleteOne();
    res.json({ message: 'Webhook deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWebhooks, createWebhook, updateWebhook, deleteWebhook };