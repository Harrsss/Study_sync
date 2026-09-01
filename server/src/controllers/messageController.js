const asyncHandler = require('../utils/asyncHandler');
const messageService = require('../services/messageService');
const { processFileUpload } = require('../services/uploadService');
const AppError = require('../utils/errors');

const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { page, limit } = req.query;

  const result = await messageService.getRoomMessages(roomId, page, limit, req.user.id);

  res.status(200).json({
    success: true,
    data: result.messages,
    pagination: result.pagination
  });
});

const uploadFileMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { caption } = req.body;

  if (!req.file) {
    throw new AppError('No file was uploaded', 400);
  }

  // Upload to Cloudinary in production or format local url
  const fileData = await processFileUpload(req.file);

  const isImage = req.file.mimetype.startsWith('image/');
  const type = isImage ? 'IMAGE' : 'FILE';

  const message = await messageService.saveMessage({
    roomId,
    senderId: req.user.id,
    senderUsername: req.user.username,
    type,
    content: caption ? caption.trim() : '',
    file: fileData
  });

  // Broadcast to Socket.IO room if socket server instance is available on app
  const io = req.app.get('io');
  if (io) {
    io.to(roomId.toString()).emit('receiveMessage', {
      _id: message._id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderUsername: message.senderUsername,
      type: message.type,
      content: message.content,
      file: message.file,
      createdAt: message.createdAt
    });
  }

  res.status(201).json({
    success: true,
    message: 'File uploaded and sent to study room',
    data: message
  });
});

module.exports = {
  getRoomMessages,
  uploadFileMessage
};
