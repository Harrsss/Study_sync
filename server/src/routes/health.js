const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redisClient = require('../config/redis');

router.get('/health', async (req, res) => {
  const startTime = Date.now();

  let mongoOk = false;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      mongoOk = true;
    }
  } catch (err) {
    mongoOk = false;
  }

  let redisOk = false;
  try {
    if (redisClient) {
      if (redisClient.status === 'ready' || redisClient.status === 'connect') {
        const pingRes = await redisClient.ping();
        redisOk = pingRes === 'PONG';
      }
    }
  } catch (err) {
    redisOk = false;
  }

  const responseTime = `${Date.now() - startTime}ms`;

  const isHealthy = mongoOk; // backend and mongo are core; redis is cache

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'StudySync server is healthy' : 'StudySync service degraded',
    timestamp: new Date().toISOString(),
    responseTime,
    checks: {
      backend: 'ok',
      mongodb: mongoOk ? 'ok' : 'error',
      redis: redisOk ? 'ok' : 'degraded'
    }
  });
});

module.exports = router;
