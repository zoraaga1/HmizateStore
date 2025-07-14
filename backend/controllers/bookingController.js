const Booking = require('../models/Booking');
const Chat = require('../models/Chat');
const Product = require('../models/product')
const mongoose = require('mongoose');

const validStatusTransitions = {
  pending: ["in_progress", "canceled", "completed"],
  in_progress: ["in_progress", "completed", "canceled"],
  completed: ["in_progress", "canceled"],
  canceled: ["in_progress", "completed",],
};

// 1. Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { productId, buyer, totalPrice } = req.body;

    const booking = new Booking({
      productId,
      // expertId: undefined,
      buyer,
      totalPrice: totalPrice || 0,
      status: "pending",
    });

    await booking.save();

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating booking" });
  }
};

// 2. Get Bookings for Logged-In Expert
exports.getExpertBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found in request" });
    }

    const expertId = req.user._id;

    const bookings = await Booking.find({ expertId })
      .populate({
        path: 'productId',
        populate: {
          path: "createdBy",
          model: "User"
        }
      })
      .populate('buyer');
      console.log("Populated bookings:", JSON.stringify(bookings[0], null, 2));
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};

// 3. Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { newStatus } = req.body;
    const expertId = req.user._id;

    // 1. Validate and update booking
    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Status transition validation
    const validTransitions = {
      pending: ['in_progress', 'canceled'],
      in_progress: ['completed', 'canceled'],
      completed: [],
      canceled: []
    };

    if (!validTransitions[booking.status].includes(newStatus)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: `Invalid status transition from ${booking.status} to ${newStatus}`
      });
    }

    // Update booking
    booking.status = newStatus;
    if (newStatus === 'in_progress') {
      booking.expertId = expertId;
    }
    await booking.save({ session });

    // Initialize chats if needed
    if (newStatus === 'in_progress') {
      await initializeBookingChats(booking, session);
    }

    await session.commitTransaction();
    res.status(200).json(booking);

  } catch (error) {
    await session.abortTransaction();
    console.error('Booking update failed:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors || null 
    });
  } finally {
    session.endSession();
  }
};

async function initializeBookingChats(booking, session) {
  // Get product with owner
  const product = await Product.findById(booking.productId)
    .select('createdBy')
    .session(session);
  
  if (!product?.createdBy) {
    throw new Error('Product owner not found');
  }

  // Create properly formatted participants array
  const participants = [
    new mongoose.Types.ObjectId(booking.expertId),
    new mongoose.Types.ObjectId(product.createdBy)
  ];

  // Create chat - ensure we're saving an array of exactly 2 ObjectIds
  const chat = await Chat.create([{
    participants: participants, // This must be an array of 2 ObjectIds
    type: 'expert-seller',
    bookingId: booking._id,
    productId: booking.productId
  }], { session });

  return chat[0];
}
// 4. Get All Pending Bookings
exports.getPendingBookings = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: "pending" })
      .populate({
        path: 'productId',
        populate: {
          path: 'createdBy',
          model: 'User'
        }
      })
      .populate('buyer');

    res.status(200).json(pendingBookings);
  } catch (err) {
    console.error("Error fetching pending bookings:", err);
    res.status(500).json({ message: "Error fetching pending bookings" });
  }
};

const requireExpert = (req, res, next) => {
  if (req.user.role !== 'expert') {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
