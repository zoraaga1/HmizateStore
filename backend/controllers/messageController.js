const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Booking = require('../models/Booking');


exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const sender = req.user._id;

    // Verify user is a participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat.participants.includes(sender)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    const message = await Message.create({
      chat: chatId,
      sender,
      content
    });

    const populatedMessage = await Message.populate(message, {
      path: 'sender',
      select: 'name email avatar'
    });

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: err.message
    });
  }
};


exports.initBookingChats = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const expertId = req.user._id;

    // Get booking details (you'll need to implement this based on your Booking model)
    const booking = await Booking.findById(bookingId)
      .populate('seller buyer');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if chats already exist
    const existingChats = await Chat.find({ bookingId });
    if (existingChats.length > 0) {
      return res.status(200).json({
        success: true,
        chats: {
          expertSellerChat: existingChats.find(c => c.type === 'expert-seller'),
          expertBuyerChat: existingChats.find(c => c.type === 'expert-buyer')
        }
      });
    }

    // Create both chats
    const [expertSellerChat, expertBuyerChat] = await Promise.all([
      Chat.create({
        participants: [expertId, booking.seller._id],
        type: 'expert-seller',
        bookingId
      }),
      Chat.create({
        participants: [expertId, booking.buyer._id],
        type: 'expert-buyer',
        bookingId
      })
    ]);

    res.status(201).json({
      success: true,
      chats: { expertSellerChat, expertBuyerChat }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize chat rooms',
      error: err.message
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email avatar');

    res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: err.message
    });
  }
};

exports.getChatParticipants = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name email avatar');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      participants: chat.participants
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants',
      error: err.message
    });
  }
};