import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ==========================================
// 1. AUTHENTICATION MIDDLEWARE (FAST VERSION)
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
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Support both decoded.id, decoded._id and decoded.userId
    const userId = decoded.id || decoded._id || decoded.userId;

    // ✅ FAST: Lightweight user object - DB query sirf zaroorat par karo
    req.userId = userId;
    req.user = { _id: userId, role: decoded.role }; // ✅ Lightweight

    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized or invalid token",
    });
  }
};

// ==========================================
// 2. DELIVERY BOY AUTHORIZATION MIDDLEWARE
// ==========================================
export const isDeliveryBoy = async (req, res, next) => {
  try {
    const userRole = req.user?.role?.toString().toLowerCase().trim();

    // Allowed delivery roles
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

export default isAuth;