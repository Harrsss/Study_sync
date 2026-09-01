const asyncHandler = require('../utils/asyncHandler');
const leaderboardService = require('../services/leaderboardService');
const AppError = require('../utils/errors');

const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await leaderboardService.getTop100();

  res.status(200).json({
    success: true,
    data: leaderboard
  });
});

const getMyRank = asyncHandler(async (req, res) => {
  const userRank = await leaderboardService.getUserRank(req.user.id);

  if (!userRank) {
    throw new AppError('User rank not found', 404);
  }

  res.status(200).json({
    success: true,
    data: userRank
  });
});

module.exports = {
  getLeaderboard,
  getMyRank
};
