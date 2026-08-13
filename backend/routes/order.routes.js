// backend/routes/order.routes.js
import express from "express";
import { 
    placeOrder, 
    getUserOrders, 
    getOrderDetails, 
    getShopOrders, 
    updateOrderStatus,
    cancelOrder,
    getOrderStatistics,
    getOrderById
} from "../controllers/order.controller.js";
import isAuth from "../middlewares/isAuth.js"; 
import { isOwner } from "../utils/isOwner.js";

const router = express.Router();

// 🟢 1. SPECIFIC / STATIC ROUTES PEHLE AAYENGE

// User specific static routes
router.post("/place-order", isAuth, placeOrder);
router.get("/my-orders", isAuth, getUserOrders);

// Admin/Owner static routes
router.get("/shop-orders", isAuth, getShopOrders); 
router.get("/statistics", isAuth, isOwner, getOrderStatistics);

// 🟢 2. DYNAMIC PARAMETER ROUTES (/:orderId, /:id etc.) HAMESHA LAST MEIN AAYENGE

// Admin routes with dynamic IDs
router.get("/admin/:orderId", isAuth, isOwner, getOrderById);

// Order status updates with dynamic parameters
router.put("/status/:orderId/:shopOrderId", isAuth, updateOrderStatus); // Frontend URL handler ke sath sync karne ke liye
router.put("/:orderId/shop-order/:shopOrderId/status", isAuth, isOwner, updateOrderStatus);

// User dynamic routes
router.put("/:orderId/cancel", isAuth, cancelOrder);
router.get("/:orderId", isAuth, getOrderDetails); // 👈 Yeh ab ekdam last mein hai

export default router;