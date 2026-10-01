import Notification from "../models/notification.model.js";

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

// 4. Create Notification Helper (Used across backend workflows)
export const createNotificationHelper = async ({ userId, title, message, type = 'order', orderId = null }) => {
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
        return notification;
    } catch (err) {
        console.error("Error creating notification helper:", err.message);
    }
};
