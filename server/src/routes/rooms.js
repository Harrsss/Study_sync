const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const taskController = require('../controllers/taskController');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All room routes require authentication
router.use(authenticate);

// Room CRUD & Membership
router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoomById);
router.post('/:roomId/join', roomController.joinRoom);
router.post('/:roomId/leave', roomController.leaveRoom);
router.delete('/:roomId', roomController.deleteRoom);
router.get('/:roomId/members', roomController.getRoomMembers);

// Nested Room Tasks & Messages
router.post('/:roomId/tasks', taskController.createTask);
router.get('/:roomId/tasks', taskController.getRoomTasks);
router.get('/:roomId/messages', messageController.getRoomMessages);
router.post('/:roomId/upload', upload.single('file'), messageController.uploadFileMessage);

module.exports = router;
