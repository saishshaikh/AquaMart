import express from "express";
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead,
    getVapidPublicKey,
    subscribePush,
    unsubscribePush,
    broadcastPushNotification,
    getNotificationStats
} from "../controllers/notification.controller.js";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Helper middleware for optional authentication on subscribe
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : req.cookies?.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id || decoded._id || decoded.userId;
        }
    } catch (err) {
        // Guest mode, proceed without user id
    }
    next();
};

// In-app Notifications
router.get("/my-notifications", isAuth, getUserNotifications);
router.put("/read/:id", isAuth, markAsRead);
router.put("/read-all", isAuth, markAllAsRead);

// Web Push Notification Endpoints
router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe", optionalAuth, subscribePush);
router.post("/unsubscribe", optionalAuth, unsubscribePush);

// Admin Broadcast & Stats Endpoints
router.post("/broadcast", isAuth, isAdmin, broadcastPushNotification);
router.get("/stats", isAuth, isAdmin, getNotificationStats);

export default router;
