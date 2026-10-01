import Coupon from "../models/coupon.model.js";

// 1. Apply Coupon (User)
export const applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase().trim(),
            isActive: true 
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
        }

        if (new Date() > new Date(coupon.validTill)) {
            return res.status(400).json({ success: false, message: "Coupon code has expired" });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        const total = Number(cartTotal) || 0;
        if (total < coupon.minOrderAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon` 
            });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = Math.round((total * coupon.discountValue) / 100);
            if (discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }

        res.status(200).json({
            success: true,
            message: `Coupon "${coupon.code}" applied! You saved ₹${discount}`,
            coupon: {
                code: coupon.code,
                discount,
                description: coupon.description
            }
        });
    } catch (error) {
        console.error("Apply Coupon Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Active Coupons (Public/User)
export const getActiveCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ 
            isActive: true, 
            validTill: { $gte: new Date() } 
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Admin: Create Coupon
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, description, validTill, usageLimit } = req.body;

        if (!code || !discountValue) {
            return res.status(400).json({ success: false, message: "Code and discount value are required" });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: "Coupon with this code already exists" });
        }

        const coupon = new Coupon({
            code: code.toUpperCase().trim(),
            discountType: discountType || 'percentage',
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount) || 0,
            maxDiscountAmount: Number(maxDiscountAmount) || 500,
            description: description || "Special promotional offer",
            validTill: validTill ? new Date(validTill) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            usageLimit: Number(usageLimit) || 100,
            isActive: true
        });

        await coupon.save();

        res.status(201).json({ success: true, message: "Coupon created successfully!", coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Admin: Get All Coupons (Including Inactive)
export const getAllCouponsAdmin = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Admin: Delete / Toggle Coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
