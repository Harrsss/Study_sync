const Message = require('../models/Message');
const Room = require('../models/Room');
const AppError = require('../utils/errors');

const getRoomMessages = async (roomId, page = 1, limit = 50, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const isMember = room.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new AppError('You must be a member to view messages in this room', 403);
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Message.countDocuments({ roomId });
  const messagesDesc = await Message.find({ roomId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  // Return in ascending chronological order for chat UI
  const messages = messagesDesc.reverse();

  return {
    messages,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

const saveMessage = async ({
  roomId,
  senderId,
  senderUsername,
  content = '',
  type = 'TEXT',
  codeSnippet,
  file
}) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const isMember = room.members.some((m) => m.toString() === senderId.toString());
  if (!isMember) {
    throw new AppError('Sender is not a member of this room', 403);
  }

  const cleanType = ['TEXT', 'CODE', 'IMAGE', 'FILE'].includes(type) ? type : 'TEXT';

  if (cleanType === 'TEXT') {
    if (!content || !content.trim()) {
      throw new AppError('Message content cannot be empty', 400);
    }
  } else if (cleanType === 'CODE') {
    if (!codeSnippet || !codeSnippet.code || !codeSnippet.code.trim()) {
      throw new AppError('Code snippet content cannot be empty', 400);
    }
  } else if (cleanType === 'IMAGE' || cleanType === 'FILE') {
    if (!file || !file.url) {
      throw new AppError('File information is required', 400);
    }
  }

  const message = await Message.create({
    roomId,
    senderId,
    senderUsername,
    type: cleanType,
    content: content ? content.trim() : '',
    codeSnippet:
      cleanType === 'CODE'
        ? {
            code: codeSnippet.code.trim(),
            language: codeSnippet.language || 'javascript'
          }
        : undefined,
    file:
      cleanType === 'IMAGE' || cleanType === 'FILE'
        ? {
            url: file.url,
            originalName: file.originalName || 'file',
            mimeType: file.mimeType || '',
            size: file.size || 0
          }
        : undefined
  });

  return message;
};

module.exports = {
  getRoomMessages,
  saveMessage
};
