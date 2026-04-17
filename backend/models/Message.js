const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true // Group messages by conversation (Application ID)
  },
  senderUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Null if system message
  },
  content: {
    type: String,
    required: true
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
