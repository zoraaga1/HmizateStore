const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  expertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  buyer: {
    name: { type: String, required: true },
    whatsapp: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "canceled"],
    default: "pending",
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Booking", BookingSchema);
