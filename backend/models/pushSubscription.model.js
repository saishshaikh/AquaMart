import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    endpoint: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    keys: {
        p256dh: {
            type: String,
            required: true
        },
        auth: {
            type: String,
            required: true
        }
    },
    userAgent: {
        type: String,
        default: ""
    },
    deviceType: {
        type: String,
        enum: ["mobile", "desktop", "tablet", "unknown"],
        default: "unknown"
    },
    active: {
        type: Boolean,
        default: true
    },
    topics: {
        type: [String],
        default: ["offers", "orders", "catch_alerts", "announcements"]
    }
}, { timestamps: true });

export default mongoose.model("PushSubscription", pushSubscriptionSchema);
