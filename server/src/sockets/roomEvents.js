const Room = require('../models/Room');

// Store active online users per room: roomId -> Map(userId -> { userId, username, count })
const roomOnlineUsers = new Map();

const getRoomOnlineList = (roomId) => {
  const usersMap = roomOnlineUsers.get(roomId.toString());
  if (!usersMap) return [];
  return Array.from(usersMap.values()).map((u) => ({
    userId: u.userId,
    username: u.username
  }));
};

const handleRoomEvents = (io, socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // Event: joinRoom
  socket.on('joinRoom', async ({ roomId }, callback) => {
    try {
      if (!roomId) return;
      const strRoomId = roomId.toString();

      // Check DB room membership
      const room = await Room.findById(strRoomId);
      if (!room || !room.members.some((m) => m.toString() === userId.toString())) {
        if (typeof callback === 'function') callback({ success: false, message: 'Not a member of this room' });
        return socket.emit('error', { message: 'Not authorized to join this room' });
      }

      socket.join(strRoomId);

      // Track online status
      if (!roomOnlineUsers.has(strRoomId)) {
        roomOnlineUsers.set(strRoomId, new Map());
      }
      const roomMap = roomOnlineUsers.get(strRoomId);
      const existing = roomMap.get(userId.toString());
      if (existing) {
        existing.count += 1;
      } else {
        roomMap.set(userId.toString(), { userId, username, count: 1 });
      }

      // Track on socket for cleanup
      if (!socket.data.joinedRooms) {
        socket.data.joinedRooms = new Set();
      }
      socket.data.joinedRooms.add(strRoomId);

      const onlineUsers = getRoomOnlineList(strRoomId);

      // Broadcast to room
      io.to(strRoomId).emit('userOnline', {
        userId,
        username,
        onlineUsers
      });

      if (typeof callback === 'function') {
        callback({ success: true, onlineUsers });
      }
    } catch (err) {
      console.error('[Socket JoinRoom Error]', err.message);
    }
  });

  // Event: leaveRoom
  socket.on('leaveRoom', ({ roomId }) => {
    try {
      if (!roomId) return;
      const strRoomId = roomId.toString();

      socket.leave(strRoomId);

      if (socket.data.joinedRooms) {
        socket.data.joinedRooms.delete(strRoomId);
      }

      const roomMap = roomOnlineUsers.get(strRoomId);
      if (roomMap && roomMap.has(userId.toString())) {
        const userEntry = roomMap.get(userId.toString());
        userEntry.count -= 1;
        if (userEntry.count <= 0) {
          roomMap.delete(userId.toString());
        }
      }

      const onlineUsers = getRoomOnlineList(strRoomId);

      io.to(strRoomId).emit('userOffline', {
        userId,
        username,
        onlineUsers
      });
    } catch (err) {
      console.error('[Socket LeaveRoom Error]', err.message);
    }
  });
};

const cleanupUserRooms = (io, socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;
  const joinedRooms = socket.data.joinedRooms;

  if (!joinedRooms || !userId) return;

  joinedRooms.forEach((strRoomId) => {
    const roomMap = roomOnlineUsers.get(strRoomId);
    if (roomMap && roomMap.has(userId.toString())) {
      const userEntry = roomMap.get(userId.toString());
      userEntry.count -= 1;
      if (userEntry.count <= 0) {
        roomMap.delete(userId.toString());
      }
    }

    const onlineUsers = getRoomOnlineList(strRoomId);
    io.to(strRoomId).emit('userOffline', {
      userId,
      username,
      onlineUsers
    });
  });
};

module.exports = {
  handleRoomEvents,
  cleanupUserRooms,
  getRoomOnlineList
};
