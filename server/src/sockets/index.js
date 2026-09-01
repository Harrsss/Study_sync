const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');
const { handleRoomEvents, cleanupUserRooms } = require('./roomEvents');
const { handleMessageEvents, cleanupUserTyping } = require('./messageEvents');

const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow connections with no origin or matching client origin
        if (!origin) return callback(null, true);
        if (
          !process.env.CLIENT_URL ||
          origin === process.env.CLIENT_URL ||
          origin.startsWith(process.env.CLIENT_URL) ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive for production WebSocket upgrades
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 25000
  });

  // Global socket authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { userId, username } = socket.data;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Socket] User connected: ${username} (${userId}) [socket: ${socket.id}]`);
    }

    // Register event domains
    handleRoomEvents(io, socket);
    handleMessageEvents(io, socket);

    // Disconnect event
    socket.on('disconnect', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[Socket] User disconnected: ${username} (${userId})`);
      }
      cleanupUserRooms(io, socket);
      cleanupUserTyping(io, socket);
    });
  });

  return io;
};

module.exports = initSocketIO;
