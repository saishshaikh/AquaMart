import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ==========================================
// 1. AUTHENTICATION MIDDLEWARE
// ==========================================
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    let role = decoded.role;
    if (!role) {
      const user = await User.findById(userId).select("role");
      role = user?.role || "user";
    }

    req.userId = userId;
    req.user = { _id: userId, id: userId, role: role.toLowerCase().trim() };

    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized or invalid token.",
    });
  }
};

// ==========================================
// 2. DELIVERY BOY AUTHORIZATION MIDDLEWARE
// ==========================================
export const isDeliveryBoy = async (req, res, next) => {
  try {
    let userRole = req.user?.role?.toString().toLowerCase().trim();
    if (!userRole && req.userId) {
      const user = await User.findById(req.userId).select("role");
      userRole = user?.role?.toString().toLowerCase().trim();
    }

    const allowedRoles = ["delivery", "delivery_boy", "deliveryboy", "driver"];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Delivery Partners are allowed.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during role verification",
    });
  }
};

// ==========================================
// 3. ADMIN AUTHORIZATION MIDDLEWARE
// ==========================================
export const isAdmin = async (req, res, next) => {
  try {
    let userRole = req.user?.role?.toString().toLowerCase().trim();
    if (!userRole && req.userId) {
      const user = await User.findById(req.userId).select("role");
      userRole = user?.role?.toString().toLowerCase().trim();
    }

    if (userRole !== "admin" && userRole !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during admin verification",
    });
  }
};

export default isAuth;