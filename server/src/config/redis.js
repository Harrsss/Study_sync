const Redis = require('ioredis');

let redisClient;

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

if (process.env.NODE_ENV === 'test' && !process.env.USE_REAL_REDIS) {
  // In test environment without a real redis server, use ioredis-mock if needed
  try {
    const RedisMock = require('ioredis-mock');
    redisClient = new RedisMock();
    console.log('[Redis] Initialized in-memory Mock for testing');
  } catch (err) {
    redisClient = new Redis(redisUrl, { lazyConnect: true });
  }
} else {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    }
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Client connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error(`[Redis] Error: ${err.message}`);
  });
}

module.exports = redisClient;
