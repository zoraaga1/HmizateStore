const Booking = require('../models/Booking');

// 1. Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { productId, buyer, totalPrice } = req.body;

    const booking = new Booking({
      productId,
      expertId: undefined,
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
      console.log("Populated bookings:", JSON.stringify(bookings[0], null, 2)); // Log first booking
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};

// 3. Accept Booking
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const expertId = req.user._id;

    // Find booking by ID (without filtering expertId)
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If already assigned to an expert, reject
    if (booking.expertId) {
      return res.status(400).json({ message: "Booking already assigned to an expert" });
    }

    booking.status = "accepted";
    booking.expertId = expertId;  // assign current expert
    await booking.save();

    res.status(200).json({
      message: "Booking accepted",
      whatsapp: booking.buyer.whatsapp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting booking" });
  }
};

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
