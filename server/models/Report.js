const mongoose = require('mongoose');

const categories = ['Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Drainage', 'Traffic Signal', 'Public Property Damage', 'Other'];
const statuses = ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const severities = ['Low', 'Medium', 'High', 'Critical'];

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    minlength: [10, 'Description must be at least 10 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: categories,
  },
  location: {
    type: String,
    required: [true, 'Please add a location description or address'],
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  images: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: statuses,
    default: 'Reported',
  },
  severity: {
    type: String,
    enum: severities,
    default: 'Medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  resolutionImages: {
    type: [String],
    default: [],
  },
  resolutionNotes: {
    type: String,
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  upvoteCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
reportSchema.index({ coordinates: '2dsphere' });
reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdBy: 1 });
reportSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Report', reportSchema);
