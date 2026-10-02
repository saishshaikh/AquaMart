import Notification from "../models/notification.model.js";
import PushSubscription from "../models/pushSubscription.model.js";
import User from "../models/user.model.js";
import { getPublicKey, sendPushToUser, broadcastPush, sendNotificationToSubscription } from "../utils/webPush.js";

// 1. Get User Notifications
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

        res.status(200).json({
            success: true,
            unreadCount,
            notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Mark Notification as Read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        await Notification.findOneAndUpdate(
            { _id: id, user: userId },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Mark All as Read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get VAPID Public Key for Frontend Push Subscription
export const getVapidPublicKey = async (req, res) => {
    try {
        const publicKey = getPublicKey();
        res.status(200).json({
            success: true,
            publicKey
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Subscribe Device to Web Push
export const subscribePush = async (req, res) => {
    try {
        const { subscription, userAgent = "", deviceType = "unknown", topics } = req.body;
        const userId = req.userId || null;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ success: false, message: "Invalid push subscription object" });
        }

        const { endpoint, keys } = subscription;

        // Upsert subscription
        const existingSub = await PushSubscription.findOneAndUpdate(
            { endpoint },
            {
                user: userId,
                keys: {
                    p256dh: keys.p256dh,
                    auth: keys.auth
                },
                userAgent,
                deviceType,
                active: true,
                ...(topics && { topics })
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send confirmation welcome notification
        try {
            await sendNotificationToSubscription(existingSub, {
                title: "🔔 Notifications Enabled!",
                message: "You'll receive instant alerts for morning fresh catch, special offers & live order tracking.",
                url: "/home",
                type: "promo"
            });
        } catch (pushErr) {
            console.log("Welcome push skipped or failed:", pushErr.message);
        }

        res.status(200).json({
            success: true,
            message: "Push notifications subscribed successfully",
            subscriptionId: existingSub._id
        });
    } catch (error) {
        console.error("subscribePush error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Unsubscribe Device from Web Push
export const unsubscribePush = async (req, res) => {
    try {
        const { endpoint } = req.body;
        const userId = req.userId || null;

        if (endpoint) {
            await PushSubscription.findOneAndUpdate({ endpoint }, { active: false });
        } else if (userId) {
            await PushSubscription.updateMany({ user: userId }, { active: false });
        }

        res.status(200).json({
            success: true,
            message: "Push notifications unsubscribed successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Admin Broadcast Push Notification
export const broadcastPushNotification = async (req, res) => {
    try {
        const {
            title,
            message,
            url = "/products",
            image,
            icon,
            type = "promo",
            target = "all" // 'all' | 'registered' | 'guests'
        } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }

        // Build filter
        const filter = {};
        if (target === "registered") {
            filter.user = { $ne: null };
        } else if (target === "guests") {
            filter.user = null;
        }

        const payload = {
            title,
            message,
            url,
            image: image || undefined,
            icon: icon || "/icons/icon-192x192.png",
            type,
            tag: `broadcast-${Date.now()}`
        };

        const result = await broadcastPush(payload, filter);

        // Store broadcast in notifications for active users
        if (target !== "guests") {
            try {
                const users = await User.find({}).select("_id").limit(100);
                const notificationDocs = users.map(u => ({
                    user: u._id,
                    title,
                    message,
                    type: type === 'discount' ? 'promo' : type === 'order' ? 'order' : 'promo',
                    isRead: false
                }));
                if (notificationDocs.length > 0) {
                    await Notification.insertMany(notificationDocs);
                }
            } catch (dbErr) {
                console.log("Error storing broadcast in notifications collection:", dbErr.message);
            }
        }

        // Emit live socket event
        if (global.io) {
            global.io.emit("notification:broadcast", {
                title,
                message,
                url,
                type,
                createdAt: new Date()
            });
        }

        res.status(200).json({
            success: true,
            message: `Broadcast sent to ${result.sent} subscribers (${result.failed} failed/expired)`,
            stats: result
        });
    } catch (error) {
        console.error("broadcastPushNotification error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Admin Notification & Push Stats
export const getNotificationStats = async (req, res) => {
    try {
        const totalSubscribers = await PushSubscription.countDocuments({ active: true });
        const mobileSubscribers = await PushSubscription.countDocuments({ active: true, deviceType: "mobile" });
        const desktopSubscribers = await PushSubscription.countDocuments({ active: true, deviceType: "desktop" });
        const registeredSubscribers = await PushSubscription.countDocuments({ active: true, user: { $ne: null } });
        const guestSubscribers = await PushSubscription.countDocuments({ active: true, user: null });

        res.status(200).json({
            success: true,
            stats: {
                totalSubscribers,
                mobileSubscribers,
                desktopSubscribers,
                registeredSubscribers,
                guestSubscribers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Create In-App + Web Push Notification Helper
export const createNotificationHelper = async ({ userId, title, message, type = 'order', orderId = null, url = null }) => {
    try {
        if (!userId) return;

        const notification = new Notification({
            user: userId,
            title,
            message,
            type,
            orderId
        });
        await notification.save();

        if (global.io) {
            global.io.emit(`notification:${userId}`, notification);
        }

        // Automatically trigger Web Push to user's registered devices
        sendPushToUser(userId, {
            title,
            message,
            url: url || (orderId ? "/my-orders" : "/home"),
            type,
            orderId
        }).catch(err => console.log("Automatic push to user skipped:", err.message));

        return notification;
    } catch (err) {
        console.error("Error creating notification helper:", err.message);
    }
};
