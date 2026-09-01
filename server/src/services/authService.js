const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/errors');
const redisClient = require('../config/redis');
const leaderboardService = require('./leaderboardService');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username
    },
    process.env.JWT_SECRET || 'dev_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRY || '7d'
    }
  );
};

const registerUser = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new AppError('Username, email, and password are required', 400);
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    throw new AppError('Username must be 3-30 characters', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Check duplicate email
  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) {
    throw new AppError('This email is already registered', 409);
  }

  // Check duplicate username
  const existingUsername = await User.findOne({ username: cleanUsername });
  if (existingUsername) {
    throw new AppError('This username is already taken', 409);
  }

  // Hash password with 10 salt rounds
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
    points: 0
  });

  // Seed user into Redis leaderboard
  try {
    await leaderboardService.setUserScore(user._id.toString(), 0);
  } catch (err) {
    console.error('[AuthService] Redis leaderboard seed error:', err.message);
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password required', 400);
  }

  const cleanEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    // Security: Generic message to prevent user enumeration
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

const logoutUser = async (token) => {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = Math.max(1, decoded.exp - now);

      if (redisClient && redisClient.status === 'ready') {
        // Set blacklist key with TTL
        await redisClient.setex(`blacklist:${token}`, ttl, 'true');
      }
    }
  } catch (err) {
    console.error('[AuthService] Logout blacklist error:', err.message);
  }

  return true;
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.toJSON();
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
};
