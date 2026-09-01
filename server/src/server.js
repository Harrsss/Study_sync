require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { connectDB } = require('./config/database');
const redisClient = require('./config/redis');
const initSocketIO = require('./sockets');
const { resyncLeaderboard } = require('./services/leaderboardService');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocketIO(server);

// Attach Socket.IO instance to app for HTTP controllers (e.g. file uploads)
app.set('io', io);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 [StudySync Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 [WebSocket Server] Initialized & listening for connections`);
    });

    // Run leaderboard resync on startup after 3s to hydrate Redis from MongoDB
    setTimeout(() => {
      resyncLeaderboard().catch((err) => console.error('[Leaderboard Sync Startup Error]', err.message));
    }, 3000);

    // Schedule hourly leaderboard resync
    setInterval(() => {
      resyncLeaderboard().catch((err) => console.error('[Leaderboard Sync Interval Error]', err.message));
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Robust Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  // 1. Close HTTP server and stop accepting new connections
  server.close(() => {
    console.log('[Server] HTTP server closed.');
  });

  // 2. Close Socket.IO connections
  if (io) {
    try {
      io.close(() => {
        console.log('[Socket] Socket.IO server closed.');
      });
    } catch (err) {
      console.error('[Socket] Error closing Socket.IO:', err.message);
    }
  }

  // 3. Disconnect MongoDB
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[MongoDB] Connection closed.');
    }
  } catch (err) {
    console.error('[MongoDB] Error disconnecting:', err.message);
  }

  // 4. Disconnect Redis
  try {
    if (redisClient && typeof redisClient.quit === 'function') {
      await redisClient.quit();
      console.log('[Redis] Connection closed.');
    }
  } catch (err) {
    console.error('[Redis] Error closing Redis:', err.message);
  }

  console.log('[Server] Graceful shutdown complete.');
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
