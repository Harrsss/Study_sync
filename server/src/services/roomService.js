const Room = require('../models/Room');
const Message = require('../models/Message');
const Task = require('../models/Task');
const AppError = require('../utils/errors');

const createRoom = async ({ name, description, subject, isPrivate, passcode }, userId) => {
  if (!name || !subject) {
    throw new AppError('Room name and subject are required', 400);
  }

  const room = await Room.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    subject: subject.trim(),
    createdBy: userId,
    members: [userId],
    isPrivate: Boolean(isPrivate),
    passcode: isPrivate && passcode ? passcode.trim() : null
  });

  await room.populate('createdBy', 'username email');
  await room.populate('members', 'username email points');

  return room;
};

const getRooms = async ({ subject, search }) => {
  const query = {};

  if (subject && subject.trim() && subject !== 'All') {
    query.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { description: searchRegex }, { subject: searchRegex }];
  }

  const rooms = await Room.find(query)
    .populate('createdBy', 'username')
    .populate('members', 'username points')
    .sort({ createdAt: -1 });

  return rooms;
};

const getRoomById = async (roomId, userId) => {
  const room = await Room.findById(roomId)
    .populate('createdBy', 'username email')
    .populate('members', 'username email points');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const isMember = room.members.some((m) => m._id.toString() === userId.toString());
  const isCreator = room.createdBy._id.toString() === userId.toString();

  if (room.isPrivate && !isMember && !isCreator) {
    throw new AppError('This is a private study room. You must enter the correct passcode to join.', 403);
  }

  return room;
};

const joinRoom = async (roomId, userId, passcode) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const isAlreadyMember = room.members.some((m) => m.toString() === userId.toString());
  if (isAlreadyMember) {
    throw new AppError('You are already a member of this room', 409);
  }

  // Validate passcode for private rooms
  if (room.isPrivate && room.passcode) {
    if (!passcode || passcode.trim() !== room.passcode) {
      throw new AppError('Incorrect room passcode. Please ask the room host for the secret passcode.', 403);
    }
  }

  room.members.push(userId);
  await room.save();

  await room.populate('createdBy', 'username email');
  await room.populate('members', 'username email points');

  return room;
};

const leaveRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.createdBy.toString() === userId.toString()) {
    throw new AppError('Creator cannot leave room', 403);
  }

  const isMember = room.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new AppError('You are not a member of this room', 400);
  }

  room.members = room.members.filter((m) => m.toString() !== userId.toString());
  await room.save();

  return { message: 'Left room successfully' };
};

const deleteRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.createdBy.toString() !== userId.toString()) {
    throw new AppError('Only creator can delete this room', 403);
  }

  // Cascade delete messages and tasks
  await Message.deleteMany({ roomId: room._id });
  await Task.deleteMany({ roomId: room._id });
  await Room.findByIdAndDelete(roomId);

  return { message: 'Room deleted' };
};

const getRoomMembers = async (roomId) => {
  const room = await Room.findById(roomId).populate('members', 'username email points');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room.members;
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomMembers
};
