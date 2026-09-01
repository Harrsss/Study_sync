const Task = require('../models/Task');
const Room = require('../models/Room');
const User = require('../models/User');
const AppError = require('../utils/errors');
const leaderboardService = require('./leaderboardService');

const createTask = async (roomId, { title, description, assignedTo, priority, dueDate }, userId) => {
  if (!title) {
    throw new AppError('Task title is required', 400);
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const isMember = room.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new AppError('You must be a member of this room to create tasks', 403);
  }

  if (assignedTo) {
    const isAssignedMember = room.members.some((m) => m.toString() === assignedTo.toString());
    if (!isAssignedMember) {
      throw new AppError('Assigned user must be a member of this study room', 400);
    }
  }

  const task = await Task.create({
    roomId,
    title: title.trim(),
    description: description ? description.trim() : '',
    assignedTo: assignedTo || null,
    createdBy: userId,
    status: 'TODO',
    priority: priority || 'LOW',
    dueDate: dueDate ? new Date(dueDate) : null,
    pointsAwarded: false
  });

  await task.populate('assignedTo', 'username email points');
  await task.populate('createdBy', 'username email');

  return task;
};

const getRoomTasks = async (roomId, { status, priority }, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const isMember = room.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new AppError('You must be a member of this room to view tasks', 403);
  }

  const query = { roomId };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'username email points')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });

  return tasks;
};

const updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const room = await Room.findById(task.roomId);
  if (!room) {
    throw new AppError('Associated room not found', 404);
  }

  const isMember = room.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new AppError('You are not authorized to update tasks in this room', 403);
  }

  const isCreator = task.createdBy.toString() === userId.toString();
  const isRoomOwner = room.createdBy.toString() === userId.toString();
  const isAssigned = task.assignedTo && task.assignedTo.toString() === userId.toString();

  // If changing status only, assigned user, creator, or room owner can update
  if (updateData.status && Object.keys(updateData).length === 1) {
    if (!isAssigned && !isCreator && !isRoomOwner) {
      throw new AppError('Only the assigned member, task creator, or room owner can change task status', 403);
    }
  } else {
    // Changing details: only creator or room owner
    if (!isCreator && !isRoomOwner) {
      throw new AppError('Only the task creator or room owner can modify task details', 403);
    }
  }

  // Handle Assigned To verification if updated
  if (updateData.assignedTo !== undefined) {
    if (updateData.assignedTo) {
      const isAssignedMember = room.members.some((m) => m.toString() === updateData.assignedTo.toString());
      if (!isAssignedMember) {
        throw new AppError('Assigned user must be a member of this study room', 400);
      }
      task.assignedTo = updateData.assignedTo;
    } else {
      task.assignedTo = null;
    }
  }

  // Points Awarding Logic with Toggle-Abuse Prevention
  if (updateData.status && updateData.status !== task.status) {
    const oldStatus = task.status;
    const newStatus = updateData.status;

    if (oldStatus !== 'COMPLETED' && newStatus === 'COMPLETED') {
      if (!task.pointsAwarded) {
        // Award points to assigned user, fallback to task creator or the user completing it
        const targetUserId = task.assignedTo || userId;

        try {
          // 1. Update MongoDB
          await User.findByIdAndUpdate(targetUserId, { $inc: { points: 10 } });
          // 2. Update Redis Sorted Set
          await leaderboardService.incrementUserScore(targetUserId, 10);
        } catch (err) {
          console.error('[TaskService] Points sync error:', err.message);
        }

        task.pointsAwarded = true;
      }
    }

    task.status = newStatus;
  }

  if (updateData.title !== undefined) task.title = updateData.title.trim();
  if (updateData.description !== undefined) task.description = updateData.description.trim();
  if (updateData.priority !== undefined) task.priority = updateData.priority;
  if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;

  await task.save();

  await task.populate('assignedTo', 'username email points');
  await task.populate('createdBy', 'username email');

  return task;
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const room = await Room.findById(task.roomId);
  const isCreator = task.createdBy.toString() === userId.toString();
  const isRoomOwner = room && room.createdBy.toString() === userId.toString();

  if (!isCreator && !isRoomOwner) {
    throw new AppError('Only the task creator or room owner can delete this task', 403);
  }

  await Task.findByIdAndDelete(taskId);
  return { message: 'Task deleted successfully' };
};

module.exports = {
  createTask,
  getRoomTasks,
  updateTask,
  deleteTask
};
