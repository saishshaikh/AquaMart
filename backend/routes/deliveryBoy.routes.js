import express from "express";
import { 
    registerDeliveryBoy, 
    loginDeliveryBoy, 
    getAvailableOrders, 
    acceptDelivery, 
    updateLocation,
    getActiveOrder,
    completeDelivery // ✅ NEW: Import completeDelivery
} from "../controllers/deliveryBoy.controller.js";
import isAuth, { isDeliveryBoy } from "../middlewares/isAuth.js";

const router = express.Router();

// 🔓 Public Routes
router.post("/register", registerDeliveryBoy);
router.post("/login", loginDeliveryBoy);

// 🔒 Protected Delivery Partner Routes
router.get("/available-orders", isAuth, isDeliveryBoy, getAvailableOrders);
router.get("/active-order", isAuth, isDeliveryBoy, getActiveOrder); 
router.post("/accept", isAuth, isDeliveryBoy, acceptDelivery);
router.put("/location", isAuth, isDeliveryBoy, updateLocation);

// ✅ NEW: Complete Delivery Route
router.put("/complete/:orderId", isAuth, isDeliveryBoy, completeDelivery);

export default router;