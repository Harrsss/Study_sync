const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me/password', userController.updatePassword);

module.exports = router;
