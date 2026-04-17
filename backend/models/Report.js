const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Can be a company or another user
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Dismissed', 'Action Taken'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
