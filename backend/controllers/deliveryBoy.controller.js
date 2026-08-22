import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================================
// 1. DELIVERY BOY REGISTER
// ==========================================
export const registerDeliveryBoy = async (req, res) => {
  try {
    const { name, email, password, mobile, city } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName: name,
      email,
      password: hashedPassword,
      mobile,
      city,
      role: "delivery",
    });

    await user.save();
    res.status(201).json({ success: true, message: "Delivery Boy Registered!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. DELIVERY BOY LOGIN
// ==========================================
export const loginDeliveryBoy = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "delivery" });
    if (!user) return res.status(404).json({ success: false, message: "Boy not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, token, user });
  } catch (error) {
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
      { new: true }
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
// ✅ 7. COMPLETE DELIVERY (FIXED FOR USER VIEW)
// ==========================================
export const completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const boyId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if this order is assigned to this delivery boy
    if (!order.deliveryDetails || order.deliveryDetails.assignedTo.toString() !== boyId.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this order" });
    }

    // 🟢 UPDATE MAIN STATUS
    order.status = 'delivered';
    order.deliveryDetails.deliveredAt = new Date();
    order.deliveryDetails.deliveryNotes = 'Order successfully delivered';

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
      note: `Order delivered by ${order.deliveryDetails.deliveryBoyName}`
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

    res.status(200).json({ success: true, message: "Order marked as delivered!" });
  } catch (error) {
    console.error("❌ Error completing delivery:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};