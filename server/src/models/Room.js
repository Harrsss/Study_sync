const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [2, 'Room name must be at least 2 characters'],
      maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Room creator is required'],
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isPrivate: {
      type: Boolean,
      default: false
    },
    passcode: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // Never leak raw passcode in general listings
        delete ret.passcode;
        return ret;
      }
    }
  }
);

// Indexes
roomSchema.index({ createdBy: 1, createdAt: -1 });
roomSchema.index({ members: 1 });

// Ensure members are unique before saving
roomSchema.pre('save', function (next) {
  if (this.members && this.members.length > 0) {
    const uniqueIds = Array.from(new Set(this.members.map((m) => m.toString())));
    this.members = uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
  }
  next();
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
