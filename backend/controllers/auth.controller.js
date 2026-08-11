// ============================================
// AUTH CONTROLLER - Authentication & Password Management
// ============================================

import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/token.js"; 
import { SendOtpMail } from "../utils/sendOtpMail.js";
import jwt from "jsonwebtoken";

// ============================================
// SECTION 1: AUTHENTICATION (Signup, Signin, Signout)
// ============================================

/**
 * @desc    User Signup
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Validate mobile number
        if (mobile.length < 10) {
            return res.status(400).json({
                message: "Mobile number must be at least 10 digits"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            fullName,
            email,
            mobile,
            role,
            password: hashPassword,
        });

        // Generate JWT token
        const token = GenerateToken(user._id);

        // Set cookie
        res.cookie("token", token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax", 
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
        });

        return res.status(201).json({
            success: true,
            message: "Signup successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            },
            token // ✅ Frontend ke liye
        });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({
            success: false,
            message: "Signup failed: " + error.message,
        });
    }
};

/**
 * @desc    User Signin
 * @route   POST /api/auth/signin
 * @access  Public
 */
const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // User find karo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Password verify karo
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // ✅ Token generate karo
        const token = GenerateToken(user._id);
        console.log("✅ Token generated for user:", user.email);

        // ✅ Cookie mein set karo
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            },
            token // Frontend ke liye
        });

    } catch (error) {
        console.error("❌ Signin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * @desc    User Signout
 * @route   POST /api/auth/signout
 * @access  Private
 */
const signout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Signout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Logout failed: " + error.message
        });
    }
};

// ============================================
// SECTION 2: PASSWORD RESET FLOW
// ============================================

/**
 * @desc    Send OTP for password reset
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();

        await SendOtpMail(user.email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email"
        });

    } catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP: " + error.message
        });
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.resetOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one."
            });
        }

        if (user.resetOtpExpire < Date.now()) {
            user.resetOtp = null;
            user.resetOtpExpire = null;
            user.isOtpVerified = false;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        user.isOtpVerified = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "OTP verification failed: " + error.message
        });
    }
};

/**
 * @desc    Reset password after OTP verification
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isOtpVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify OTP first",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpire = null;
        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// SECTION 3: GOOGLE AUTH
// ============================================
const googleAuth = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        role: "user",
        isGoogleUser: true,
      });
    }

    console.log("✅ Google User:", user.email);
    console.log("✅ User ID:", user._id);

    const token = GenerateToken(user._id);

    console.log("✅ Generated Token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // localhost
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      token // ✅ FIXED: Token yahan add kar diya
    });
  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// SECTION 4: EXPORT CONTROLLERS
// ============================================

export {
    signup,
    signin,
    signout,
    sendOtp,
    verifyOtp,
    resetPassword,
    googleAuth
};