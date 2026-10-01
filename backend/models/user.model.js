import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
    },
    
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "owner", "user", "delivery", "deliveryboy", "delivery_boy", "Delivery"],
      default: "user",
      required: true,
    },

    // 🚀 Delivery Partner Fields
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    deliveryStatus: {
      type: String,
      enum: ["available", "on_delivery", "offline", "suspended"],
      default: "available",
    },

    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    },

    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    // OTP Fields for Password Reset
    resetOtp: {
      type: String,
      default: null,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    resetOtpExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (email already indexed via unique: true)
userSchema.index({ role: 1 });
userSchema.index({ city: 1, role: 1 });

const User = mongoose.model("User", userSchema);

export default User;