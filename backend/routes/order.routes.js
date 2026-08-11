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
import { isOwner } from "../utils/isOwner.js"; // ✅ Already exists

const router = express.Router();

// 🟢 User routes (Sirf login chahiye)
router.post("/place-order", isAuth, placeOrder);
router.get("/my-orders", isAuth, getUserOrders);
router.get("/:orderId", isAuth, getOrderDetails);
router.put("/:orderId/cancel", isAuth, cancelOrder);

// 🟢 Owner routes (Login + Owner role)
router.get("/shop-orders", isAuth, isOwner, getShopOrders);
router.put("/:orderId/shop-order/:shopOrderId/status", isAuth, isOwner, updateOrderStatus);

// 🟢 Admin/Owner routes (Login + Owner role - for statistics and admin views)
router.get("/statistics", isAuth, isOwner, getOrderStatistics);
router.get("/admin/:orderId", isAuth, isOwner, getOrderById);

export default router;