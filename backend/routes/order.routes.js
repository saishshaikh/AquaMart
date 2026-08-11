import express from "express";
import { 
    placeOrder, 
    getUserOrders, 
    getOrderDetails, 
    getShopOrders, 
    updateOrderStatus 
} from "../controllers/order.controller.js";
import isAuth from "../middlewares/isAuth.js"; 
import { isOwner } from "../utils/isOwner.js"; // ✅ Ye import bilkul sahi hai

const router = express.Router();

// 🟢 Public/semi-public route (Sirf login chahiye)
router.post("/place-order", isAuth, placeOrder);
router.get("/my-orders", isAuth, getUserOrders);
router.get("/:orderId", isAuth, getOrderDetails);

// 🟢 Owner/Admin specific routes (Login + Role dono chahiye)
router.get("/shop-orders", isAuth, isOwner, getShopOrders);
router.put("/:orderId/shop-order/:shopOrderId/status", isAuth, isOwner, updateOrderStatus);

export default router;