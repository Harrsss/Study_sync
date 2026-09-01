const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    senderUsername: {
      type: String,
      required: [true, 'Sender username is required']
    },
    type: {
      type: String,
      enum: ['TEXT', 'CODE', 'IMAGE', 'FILE'],
      default: 'TEXT'
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      default: ''
    },
    codeSnippet: {
      code: { type: String, default: '' },
      language: { type: String, default: 'javascript' }
    },
    file: {
      url: { type: String, default: '' },
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for message history pagination and ordering
messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
