const asyncHandler = require('../utils/asyncHandler');
const roomService = require('../services/roomService');

const createRoom = asyncHandler(async (req, res) => {
  const { name, description, subject, isPrivate, passcode } = req.body;
  const room = await roomService.createRoom({ name, description, subject, isPrivate, passcode }, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Room created successfully',
    data: room
  });
});

const getRooms = asyncHandler(async (req, res) => {
  const { subject, search } = req.query;
  const rooms = await roomService.getRooms({ subject, search });

  res.status(200).json({
    success: true,
    data: rooms
  });
});

const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.getRoomById(roomId, req.user.id);

  res.status(200).json({
    success: true,
    data: room
  });
});

const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { passcode } = req.body;
  const room = await roomService.joinRoom(roomId, req.user.id, passcode);

  res.status(200).json({
    success: true,
    message: 'Joined room successfully',
    data: room
  });
});

const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const result = await roomService.leaveRoom(roomId, req.user.id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const result = await roomService.deleteRoom(roomId, req.user.id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

const getRoomMembers = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const members = await roomService.getRoomMembers(roomId);

  res.status(200).json({
    success: true,
    data: members
  });
});

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomMembers
};
