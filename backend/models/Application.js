const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: [
      'Resume Received', 
      'Resume Verified', 
      'Shortlisted', 
      'Assessment Pending', 
      'Technical Interview', 
      'HR Interview', 
      'Selected', 
      'Rejected'
    ],
    default: 'Resume Received'
  },
  atsScore: {
    type: Number,
    default: 0
  },
  viewedByCompany: {
    type: Boolean,
    default: false
  },
  coverLetter: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
