const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');
const leaderboardService = require('../services/leaderboardService');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const rankData = await leaderboardService.getUserRank(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      ...user.toJSON(),
      rank: rankData ? rankData.rank : null
    }
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

module.exports = {
  getProfile,
  updatePassword
};
