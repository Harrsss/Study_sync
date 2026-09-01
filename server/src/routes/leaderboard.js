const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticate } = require('../middleware/auth');

router.get('/', leaderboardController.getLeaderboard);
router.get('/me', authenticate, leaderboardController.getMyRank);

module.exports = router;
