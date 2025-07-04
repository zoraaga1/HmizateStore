const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const protect = require("../middlewares/auth");

// 1. Create booking (called from buyer form)
router.post('/', bookingController.createBooking);

// 2. Get bookings for logged-in expert
router.get('/expert/bookings', protect, bookingController.getExpertBookings);

// 3. Accept a booking by ID
router.post('/:id/accept', protect, bookingController.acceptBooking);

// 4. Get all pending bookings
router.get("/pending", protect, bookingController.getPendingBookings);

module.exports = router;
