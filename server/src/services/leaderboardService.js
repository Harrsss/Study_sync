const User = require('../models/User');
const redisClient = require('../config/redis');

const LEADERBOARD_KEY = 'leaderboard';

const incrementUserScore = async (userId, points) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    await redisClient.zincrby(LEADERBOARD_KEY, points, userId.toString());
  } catch (err) {
    console.error('[LeaderboardService] Error incrementing user score in Redis:', err.message);
  }
};

const setUserScore = async (userId, points) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    await redisClient.zadd(LEADERBOARD_KEY, points, userId.toString());
  } catch (err) {
    console.error('[LeaderboardService] Error setting user score in Redis:', err.message);
  }
};

const getTop100 = async () => {
  try {
    let rawResults = [];
    if (redisClient && redisClient.status === 'ready') {
      rawResults = await redisClient.zrevrange(LEADERBOARD_KEY, 0, 99, 'WITHSCORES');
    }

    if (rawResults && rawResults.length > 0) {
      // Redis returned pairs: [userId1, score1, userId2, score2, ...]
      const userIds = [];
      const scoreMap = {};

      for (let i = 0; i < rawResults.length; i += 2) {
        const uid = rawResults[i];
        const score = parseInt(rawResults[i + 1], 10) || 0;
        userIds.push(uid);
        scoreMap[uid] = score;
      }

      const users = await User.find({ _id: { $in: userIds } }).select('_id username email points');
      const userObjMap = {};
      users.forEach((u) => {
        userObjMap[u._id.toString()] = u;
      });

      const leaderboard = [];
      for (let i = 0; i < userIds.length; i++) {
        const uid = userIds[i];
        const user = userObjMap[uid];
        leaderboard.push({
          rank: i + 1,
          userId: uid,
          username: user ? user.username : 'Unknown',
          points: scoreMap[uid] !== undefined ? scoreMap[uid] : (user ? user.points : 0)
        });
      }

      return leaderboard;
    }

    // Fallback if Redis has no data or is not ready: query MongoDB and seed Redis
    const users = await User.find().sort({ points: -1, createdAt: 1 }).limit(100).select('_id username points');
    return users.map((u, index) => ({
      rank: index + 1,
      userId: u._id.toString(),
      username: u.username,
      points: u.points
    }));
  } catch (err) {
    console.error('[LeaderboardService] Error getting top 100:', err.message);
    const users = await User.find().sort({ points: -1, createdAt: 1 }).limit(100).select('_id username points');
    return users.map((u, index) => ({
      rank: index + 1,
      userId: u._id.toString(),
      username: u.username,
      points: u.points
    }));
  }
};

const getUserRank = async (userId) => {
  const user = await User.findById(userId).select('_id username points');
  if (!user) {
    return null;
  }

  const strUserId = user._id.toString();

  try {
    if (redisClient && redisClient.status === 'ready') {
      const rank0 = await redisClient.zrevrank(LEADERBOARD_KEY, strUserId);
      const score = await redisClient.zscore(LEADERBOARD_KEY, strUserId);

      if (rank0 !== null && score !== null) {
        return {
          rank: rank0 + 1,
          userId: strUserId,
          username: user.username,
          points: parseInt(score, 10)
        };
      }
    }
  } catch (err) {
    console.error('[LeaderboardService] Error getting user rank from Redis:', err.message);
  }

  // Fallback if not in Redis or Redis is down: calculate rank with Mongo count
  const higherRankCount = await User.countDocuments({ points: { $gt: user.points } });
  return {
    rank: higherRankCount + 1,
    userId: strUserId,
    username: user.username,
    points: user.points
  };
};

const resyncLeaderboard = async () => {
  if (!redisClient || redisClient.status !== 'ready') return;

  try {
    const users = await User.find().select('_id points');
    if (users.length === 0) return;

    // Delete existing leaderboard and batch insert using pipeline
    const pipeline = redisClient.pipeline();
    pipeline.del(LEADERBOARD_KEY);

    users.forEach((user) => {
      pipeline.zadd(LEADERBOARD_KEY, user.points, user._id.toString());
    });

    await pipeline.exec();
    console.log(`[LeaderboardService] Synced ${users.length} users into Redis leaderboard`);
  } catch (err) {
    console.error('[LeaderboardService] Resync failed:', err.message);
  }
};

module.exports = {
  incrementUserScore,
  setUserScore,
  getTop100,
  getUserRank,
  resyncLeaderboard
};
