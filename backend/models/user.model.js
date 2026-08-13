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
    },

    // 📍 Yahan city field add kar di hai
    city: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "user", "delivery", "deliveryboy", "Delivery"],
      required: true,
    },

    // OTP Fields
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

const User = mongoose.model("User", userSchema);

export default User;