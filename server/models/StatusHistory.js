const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
    index: true,
  },
  previousStatus: {
    type: String,
  },
  newStatus: {
    type: String,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  note: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
