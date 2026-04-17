const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skillsRequired: [{
    type: String
  }],
  salary: String,
  location: String,
  type: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site', 'Full-time', 'Part-time', 'Internship']
  },
  applicationLink: { type: String }, // For external form links
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
