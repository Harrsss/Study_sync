const jwt = require('jsonwebtoken');
const AppError = require('../utils/errors');
const redisClient = require('../config/redis');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    // Check Redis blacklist (if Redis is active)
    try {
      if (redisClient && redisClient.status === 'ready') {
        const isBlacklisted = await redisClient.exists(`blacklist:${token}`);
        if (isBlacklisted) {
          return next(new AppError('Token has been revoked. Please log in again.', 401));
        }
      }
    } catch (redisErr) {
      // Degrade gracefully if redis check throws
      console.error('[Redis Blacklist Check Warning]', redisErr.message);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

module.exports = {
  authenticate
};
