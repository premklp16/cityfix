const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Prevent multiple follow entries for same report by same user
followSchema.index({ reportId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
