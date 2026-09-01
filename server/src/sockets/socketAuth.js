const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const socketAuth = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Check Redis blacklist
    try {
      if (redisClient && redisClient.status === 'ready') {
        const isBlacklisted = await redisClient.exists(`blacklist:${token}`);
        if (isBlacklisted) {
          return next(new Error('Authentication error: Token revoked'));
        }
      }
    } catch (err) {
      // Degrade gracefully
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    socket.data.userId = decoded.id;
    socket.data.username = decoded.username;
    socket.data.token = token;

    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};

module.exports = socketAuth;
