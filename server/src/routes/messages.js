const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Alias to get room messages: GET /api/messages/:roomId
router.get('/:roomId', messageController.getRoomMessages);

module.exports = router;
