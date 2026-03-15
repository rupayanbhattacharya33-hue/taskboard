const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Webhook URL is required'],
    trim: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  events: [{
    type: String,
    enum: ['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  secret: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Webhook = mongoose.model('Webhook', webhookSchema);
module.exports = Webhook;