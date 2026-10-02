import webPush from "web-push";
import dotenv from "dotenv";
import PushSubscription from "../models/pushSubscription.model.js";

dotenv.config();

// Ensure VAPID keys exist
let vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@aquamart.in";

if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("Generating new VAPID keys for Web Push Notifications...");
    const vapidKeys = webPush.generateVAPIDKeys();
    vapidPublicKey = vapidKeys.publicKey;
    vapidPrivateKey = vapidKeys.privateKey;
    process.env.VAPID_PUBLIC_KEY = vapidPublicKey;
    process.env.VAPID_PRIVATE_KEY = vapidPrivateKey;
    console.log("VAPID Public Key:", vapidPublicKey);
}

try {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    console.log("Web Push VAPID configuration initialized successfully.");
} catch (err) {
    console.error("Error configuring web-push VAPID details:", err.message);
}

export const getPublicKey = () => vapidPublicKey;

/**
 * Send a web push notification to a single PushSubscription document or raw subscription object
 */
export const sendNotificationToSubscription = async (subscriptionDoc, payload) => {
    try {
        const pushConfig = {
            endpoint: subscriptionDoc.endpoint,
            keys: {
                p256dh: subscriptionDoc.keys.p256dh,
                auth: subscriptionDoc.keys.auth
            }
        };

        const payloadString = JSON.stringify({
            title: payload.title || "AquaMart Fresh Seafood",
            body: payload.message || payload.body || "New update available from AquaMart",
            icon: payload.icon || "/icons/icon-192x192.png",
            badge: payload.badge || "/icons/icon-192x192.png",
            image: payload.image || undefined,
            tag: payload.tag || `aquamart-${Date.now()}`,
            data: {
                url: payload.url || "/home",
                type: payload.type || "promo",
                orderId: payload.orderId || null,
                timestamp: Date.now()
            },
            actions: payload.actions || [
                { action: "open_url", title: "View Now 🌊" }
            ],
            vibrate: [200, 100, 200]
        });

        await webPush.sendNotification(pushConfig, payloadString);
        return { success: true, endpoint: subscriptionDoc.endpoint };
    } catch (error) {
        // HTTP 410 (Gone) or 404 (Not Found) means the push subscription has expired or was revoked
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Push subscription expired (${error.statusCode}). Deactivating endpoint:`, subscriptionDoc.endpoint);
            try {
                await PushSubscription.deleteOne({ endpoint: subscriptionDoc.endpoint });
            } catch (dbErr) {
                console.error("Failed to delete expired subscription:", dbErr.message);
            }
        } else {
            console.error("Web Push sending error:", error.statusCode || error.message);
        }
        return { success: false, endpoint: subscriptionDoc.endpoint, error: error.message, statusCode: error.statusCode };
    }
};

/**
 * Send push notification to all active devices of a specific user
 */
export const sendPushToUser = async (userId, payload) => {
    try {
        if (!userId) return { success: false, message: "User ID required" };
        const subscriptions = await PushSubscription.find({ user: userId, active: true });
        if (!subscriptions || subscriptions.length === 0) {
            return { success: false, message: "No active push subscriptions for user", count: 0 };
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub => sendNotificationToSubscription(sub, payload))
        );

        const successCount = results.filter(r => r.status === "fulfilled" && r.value.success).length;
        return { success: true, count: subscriptions.length, sent: successCount };
    } catch (error) {
        console.error("sendPushToUser Error:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Broadcast push notification to all subscribed devices (or filtered by target/topic)
 */
export const broadcastPush = async (payload, filter = {}) => {
    try {
        const query = { active: true, ...filter };
        const subscriptions = await PushSubscription.find(query);

        console.log(`Broadcasting Web Push to ${subscriptions.length} subscribers...`);

        const results = await Promise.allSettled(
            subscriptions.map(sub => sendNotificationToSubscription(sub, payload))
        );

        const sent = results.filter(r => r.status === "fulfilled" && r.value.success).length;
        const failed = results.length - sent;

        return {
            success: true,
            totalSubscribers: subscriptions.length,
            sent,
            failed
        };
    } catch (error) {
        console.error("broadcastPush Error:", error.message);
        return { success: false, error: error.message };
    }
};

export default {
    getPublicKey,
    sendNotificationToSubscription,
    sendPushToUser,
    broadcastPush
};
