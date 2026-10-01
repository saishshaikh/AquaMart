import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 1
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        default: 500
    },
    description: {
        type: String,
        default: "Special promotional discount"
    },
    validTill: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: 100
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
