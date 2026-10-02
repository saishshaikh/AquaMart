import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createNotificationHelper } from "./notification.controller.js";

// ==========================================
// 1. DELIVERY BOY REGISTER
// ==========================================
export const registerDeliveryBoy = async (req, res) => {
  try {
    const { name, email, password, mobile, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName: name,
      email,
      password: hashedPassword,
      mobile: mobile || "",
      city: city || "",
      role: "delivery",
      deliveryStatus: "available"
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ 
      success: true, 
      message: "Delivery Partner Registered Successfully!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        city: user.city
      }
    });
  } catch (error) {
    console.error("Register Delivery Boy Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. DELIVERY BOY LOGIN
// ==========================================
export const loginDeliveryBoy = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ 
      email, 
      role: { $in: ["delivery", "delivery_boy", "deliveryboy", "Delivery"] } 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Delivery partner not found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ 
      success: true, 
      message: "Delivery partner logged in successfully",
      token, 
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        city: user.city,
        activeOrderId: user.activeOrderId,
        deliveryStatus: user.deliveryStatus
      }
    });
  } catch (error) {
    console.error("Login Delivery Boy Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. GET AVAILABLE ORDERS (Global - No Location Filter)
// ==========================================
export const getAvailableOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Fetch all active orders that are not yet assigned
    const orders = await Order.find({
      status: { $in: ["out_for_delivery", "pending", "ready_for_pickup", "dispatched", "placed"] },
      $or: [
        { "deliveryDetails.assignedTo": null },
        { "deliveryDetails.assignedTo": { $exists: false } },
      ],
    })
      .populate("shopOrders.shop")
      .populate("user", "fullName mobile")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("❌ Error fetching available orders:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. ACCEPT DELIVERY ORDER (No Validation Issues)
// ==========================================
export const acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const boyId = req.userId;

    const user = await User.findById(boyId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.deliveryDetails?.assignedTo) {
      return res.status(400).json({ success: false, message: "Order already taken by another boy" });
    }

    // Update order using findByIdAndUpdate to bypass schema validation
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: "out_for_delivery",
          deliveryDetails: {
            assignedTo: boyId,
            assignedAt: new Date(),
            acceptedAt: new Date(),
            deliveryBoyName: user.fullName,
            deliveryBoyMobile: user.mobile,
            deliveryNotes: "Accepted",
          },
        },
      },
      { returnDocument: 'after' }
    );

    await User.findByIdAndUpdate(boyId, {
      activeOrderId: orderId,
      deliveryStatus: "on_delivery",
    });

    // ✅ Real-time Update to Customer (User ko turant pata chale)
    if (global.io) {
      global.io.emit(`order:${orderId}`, {
        status: "out_for_delivery",
        deliveryBoyName: user.fullName,
        deliveryBoyMobile: user.mobile,
      });

      // Send Push Notification
      createNotificationHelper({
        userId: updatedOrder.user,
        title: "🚚 Delivery Partner Assigned!",
        message: `${user.fullName} is delivering your order #${updatedOrder._id.toString().slice(-6).toUpperCase()}. Track live on map!`,
        type: "delivery",
        orderId: updatedOrder._id,
        url: "/my-orders"
      }).catch(() => {});
    }

    res.status(200).json({ success: true, message: "Order Accepted Successfully!", order: updatedOrder });
  } catch (error) {
    console.error("❌ Accept Delivery Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. UPDATE LOCATION (Live Tracking ke liye)
// ==========================================
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng, orderId } = req.body;
    
    // ✅ Delivery Boy ki location save karein
    await User.findByIdAndUpdate(req.userId, {
      currentLocation: { lat, lng },
      lastSeenAt: new Date(),
    });

    // ✅ Live Tracking Broadcast (Socket.IO se user ko bhejo)
    if (global.io && orderId) {
      global.io.emit(`location:${orderId}`, { lat, lng });
    }

    res.status(200).json({ success: true, message: "Location updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. GET ACTIVE ORDER
// ==========================================
export const getActiveOrder = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.activeOrderId) {
      return res.status(200).json({ success: true, order: null });
    }

    const order = await Order.findById(user.activeOrderId)
      .populate("user", "fullName mobile")
      .populate("shopOrders.shop", "address name")
      .populate({
        path: "deliveryDetails.assignedTo", // ✅ Delivery Boy ka Data
        select: "fullName mobile"
      });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error fetching active order:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ✅ 7. COMPLETE DELIVERY (WITH OTP VERIFICATION)
// ==========================================
export const completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const boyId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if this order is assigned to this delivery boy
    if (!order.deliveryDetails || order.deliveryDetails.assignedTo.toString() !== boyId.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this order" });
    }

    // 🔐 Secure Delivery OTP Validation
    if (order.deliveryOtp) {
      if (!otp) {
        return res.status(400).json({ 
          success: false, 
          message: "Delivery OTP is required. Please ask the customer for their 4-digit OTP." 
        });
      }
      if (otp.toString().trim() !== order.deliveryOtp.toString().trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "Incorrect OTP entered! Please verify with customer." 
        });
      }
    }

    // 🟢 UPDATE MAIN STATUS
    order.status = 'delivered';
    order.isOtpVerified = true;
    order.deliveryDetails.deliveredAt = new Date();
    order.deliveryDetails.deliveryNotes = 'Order successfully delivered with OTP verification';

    // 🟢 FIX: UPDATE ALL SHOP ORDER STATUSES (SO USER SEES 'DELIVERED')
    order.shopOrders.forEach(shopOrder => {
      shopOrder.shopStatus = 'delivered';
    });

    // 🟢 TRACKING HISTORY
    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }
    order.trackingHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      note: `Order verified with OTP and delivered by ${order.deliveryDetails.deliveryBoyName}`
    });

    await order.save({ validateBeforeSave: false });

    // 🟢 UPDATE DELIVERY BOY STATUS
    await User.findByIdAndUpdate(boyId, {
      activeOrderId: null,
      deliveryStatus: 'available',
      $inc: { totalDeliveries: 1 }
    });

    // ✅ Customer ko real-time status update bhejo
    if (global.io) {
      global.io.emit(`order:${orderId}`, {
        status: "delivered",
        deliveredAt: new Date(),
      });
    }

    createNotificationHelper({
      userId: order.user,
      title: "🎉 Order Delivered!",
      message: `Your seafood order #${order._id.toString().slice(-6).toUpperCase()} has been delivered successfully! Enjoy your fresh catch.`,
      type: "delivery",
      orderId: order._id,
      url: "/my-orders"
    }).catch(() => {});

    res.status(200).json({ success: true, message: "Order marked as delivered with OTP verification!" });
  } catch (error) {
    console.error("❌ Error completing delivery:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};