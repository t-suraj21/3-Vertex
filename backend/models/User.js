const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Student Specific Profile Details
  name: { type: String },
  avatar: { type: String }, // URL or path to profile image
  resume: { type: String }, 
  skills: [{ type: String }],
  phone: { type: String },
  location: { type: String },
  github: { type: String },
  linkedin: { type: String },
  portfolio: { type: String },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  
  // Company Specific
  companyName: { type: String },
  govRegId: { type: String },
  gstCin: { type: String },
  verifiedStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
