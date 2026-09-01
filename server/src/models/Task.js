const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
      default: 'TODO',
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW'
    },
    dueDate: {
      type: Date,
      default: null
    },
    pointsAwarded: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
taskSchema.index({ roomId: 1, status: 1 });
taskSchema.index({ roomId: 1, createdAt: -1 });

// Validation: Ensure assigned user is a member of the room
taskSchema.pre('save', async function (next) {
  if (this.assignedTo) {
    const room = await mongoose.model('Room').findOne({
      _id: this.roomId,
      members: this.assignedTo
    });

    if (!room) {
      const error = new Error('Assigned user must be a member of this study room');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
