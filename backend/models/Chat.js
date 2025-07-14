const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    validate: {
      validator: function(participants) {
        return participants.length === 2;
      },
      message: 'Chat must have exactly 2 participants'
    }
  },
    type: { 
    type: String, 
    enum: ["expert-seller", "expert-buyer", "direct"], 
    required: true 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking" 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

function arrayLimit(val) {
  return val.length === 2;
}

module.exports = mongoose.model("Chat", ChatSchema);