const messageService = require('../services/messageService');

// Map to manage typing timeouts: `${userId}:${roomId}` -> Timeout ID
const typingTimeouts = new Map();
const lastTypingSent = new Map();

const handleMessageEvents = (io, socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // Event: sendMessage
  socket.on('sendMessage', async (payload, callback) => {
    try {
      const { roomId, content, type = 'TEXT', codeSnippet, file } = payload || {};

      if (!roomId) {
        if (typeof callback === 'function') callback({ success: false, message: 'Room ID is required' });
        return;
      }

      // Persist in MongoDB and verify membership
      const savedMessage = await messageService.saveMessage({
        roomId,
        senderId: userId,
        senderUsername: username,
        content: content ? content.trim() : '',
        type,
        codeSnippet,
        file
      });

      const messagePayload = {
        _id: savedMessage._id,
        roomId: savedMessage.roomId,
        senderId: savedMessage.senderId,
        senderUsername: savedMessage.senderUsername,
        type: savedMessage.type,
        content: savedMessage.content,
        codeSnippet: savedMessage.codeSnippet,
        file: savedMessage.file,
        createdAt: savedMessage.createdAt
      };

      // Broadcast to room members
      io.to(roomId.toString()).emit('receiveMessage', messagePayload);

      // Clear typing indicator for this user immediately
      const typingKey = `${userId}:${roomId}`;
      if (typingTimeouts.has(typingKey)) {
        clearTimeout(typingTimeouts.get(typingKey));
        typingTimeouts.delete(typingKey);
        io.to(roomId.toString()).emit('userStoppedTyping', { userId });
      }

      if (typeof callback === 'function') {
        callback({ success: true, data: messagePayload });
      }
    } catch (err) {
      console.error('[Socket SendMessage Error]', err.message);
      if (typeof callback === 'function') {
        callback({ success: false, message: err.message });
      }
    }
  });

  // Event: typing
  socket.on('typing', ({ roomId }) => {
    try {
      if (!roomId) return;
      const strRoomId = roomId.toString();
      const typingKey = `${userId}:${strRoomId}`;
      const now = Date.now();

      // Rate limit: at most once every 1 second
      const lastSent = lastTypingSent.get(typingKey) || 0;
      if (now - lastSent >= 1000) {
        lastTypingSent.set(typingKey, now);
        socket.to(strRoomId).emit('userTyping', { userId, username });
      }

      // Clear existing timeout
      if (typingTimeouts.has(typingKey)) {
        clearTimeout(typingTimeouts.get(typingKey));
      }

      // Auto-clear after 3 seconds
      const timeoutId = setTimeout(() => {
        io.to(strRoomId).emit('userStoppedTyping', { userId });
        typingTimeouts.delete(typingKey);
      }, 3000);

      typingTimeouts.set(typingKey, timeoutId);
    } catch (err) {
      console.error('[Socket Typing Error]', err.message);
    }
  });

  // Event: stopTyping
  socket.on('stopTyping', ({ roomId }) => {
    try {
      if (!roomId) return;
      const strRoomId = roomId.toString();
      const typingKey = `${userId}:${strRoomId}`;

      if (typingTimeouts.has(typingKey)) {
        clearTimeout(typingTimeouts.get(typingKey));
        typingTimeouts.delete(typingKey);
      }

      io.to(strRoomId).emit('userStoppedTyping', { userId });
    } catch (err) {
      console.error('[Socket StopTyping Error]', err.message);
    }
  });
};

const cleanupUserTyping = (io, socket) => {
  const userId = socket.data.userId;
  if (!userId) return;

  for (const [key, timeoutId] of typingTimeouts.entries()) {
    if (key.startsWith(`${userId}:`)) {
      clearTimeout(timeoutId);
      typingTimeouts.delete(key);
      const roomId = key.split(':')[1];
      if (roomId) {
        io.to(roomId).emit('userStoppedTyping', { userId });
      }
    }
  }
};

module.exports = {
  handleMessageEvents,
  cleanupUserTyping
};
