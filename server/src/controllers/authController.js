const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const result = await authService.registerUser({ username, email, password });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.token);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe
};
