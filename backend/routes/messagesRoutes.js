const express = require('express');
const messageController = require('../controllers/messageController');
const protect = require("../middlewares/auth");
const router = express.Router();

// Chat initialization
router.post('/init-booking-chats', protect, messageController.initBookingChats);

// Message routes
router.post('/:chatId/messages', protect, messageController.sendMessage);
router.get('/:chatId/messages', protect, messageController.getMessages);
router.get('/:chatId/participants', protect, messageController.getChatParticipants);

module.exports = router;