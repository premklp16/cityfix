const mongoose = require('mongoose');

const notificationTypes = ['status_change', 'comment', 'assignment', 'upvote', 'general'];

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: notificationTypes,
    default: 'general',
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for querying unread notifications for a user efficiently
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
