// backend/models/deliveryBoy.model.js
import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema({
  // === 1. Basic Personal Info ===
  name: { 
    type: String, 
    required: [true, "Name is required"], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  mobile: { 
    type: String, 
    required: [true, "Mobile number is required"],
    unique: true,
    trim: true
  },
  profileImage: { 
    type: String, 
    default: "https://via.placeholder.com/150" 
  },
  city: { 
    type: String, 
    required: [true, "City is required"],
    index: true // ✅ Fast search for city-based requests
  },

  // === 2. Delivery Status & Availability ===
  status: { 
    type: String, 
    enum: ['available', 'on_delivery', 'offline', 'suspended'], 
    default: 'available' 
  },
  isOnline: { 
    type: Boolean, 
    default: false 
  },
  lastSeenAt: { 
    type: Date, 
    default: Date.now 
  },

  // === 3. Live Location Tracking (Real-time) ===
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  // ✅ 2dsphere index for location-based queries
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },

  // === 4. Active Order Management ===
  activeOrderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", 
    default: null 
  },
  orderHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    deliveredAt: { type: Date },
    deliveryTime: { type: Number }, // in minutes
    rating: { type: Number, min: 1, max: 5 }
  }],

  // === 5. Performance & Ratings ===
  totalDeliveries: { 
    type: Number, 
    default: 0 
  },
  totalEarnings: { 
    type: Number, 
    default: 0 
  },
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: { 
    type: Number, 
    default: 0 
  },

  // === 6. Vehicle Information ===
  vehicleType: { 
    type: String, 
    enum: ['bicycle', 'bike', 'scooter', 'car', 'van'], 
    default: 'bike' 
  },
  vehicleNumber: { 
    type: String, 
    trim: true 
  },

  // === 7. Bank & Payment Details (For commission transfers) ===
  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String }
  },

  // === 8. Commission & Earnings Configuration ===
  commissionRate: { 
    type: Number, 
    default: 10 // 10% commission per delivery
  },

  // === 9. Admin Verification ===
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  documents: {
    aadharCard: { type: String }, // URL to uploaded document
    drivingLicense: { type: String },
    rcBook: { type: String }
  }
}, { 
  timestamps: true 
});

// ✅ Indexes for Fast Queries
deliveryBoySchema.index({ city: 1, status: 1, isOnline: 1 });
deliveryBoySchema.index({ 'currentLocation.coordinates': '2dsphere' });

// ✅ Instance Method: Calculate average rating
deliveryBoySchema.methods.calculateAverageRating = function() {
  if (this.orderHistory.length === 0) return 0;
  const totalRating = this.orderHistory.reduce((sum, order) => sum + order.rating, 0);
  return totalRating / this.orderHistory.length;
};

// ✅ Pre-save Hook: Automatically update averageRating
deliveryBoySchema.pre('save', function(next) {
  if (this.orderHistory && this.orderHistory.length > 0) {
    this.averageRating = this.calculateAverageRating();
  }
  next();
});

export default mongoose.model("DeliveryBoy", deliveryBoySchema);