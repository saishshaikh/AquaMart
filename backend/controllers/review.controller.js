import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Item from "../models/item.model.js";

// 1. Add Review (Customer)
export const addReview = async (req, res) => {
    try {
        const { itemId, rating, comment, orderId } = req.body;
        const userId = req.userId;

        if (!itemId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Item ID, rating (1-5) and comment are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        const review = new Review({
            user: userId,
            userName: user.fullName || "Customer",
            item: itemId,
            rating: Number(rating),
            comment: comment.trim(),
            orderId: orderId || null,
            isVerifiedPurchase: true
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: "Thank you for your feedback! Review posted successfully.",
            review
        });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Reviews for a Product
export const getItemReviews = async (req, res) => {
    try {
        const { itemId } = req.params;
        const reviews = await Review.find({ item: itemId }).sort({ createdAt: -1 });

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "5.0";

        res.status(200).json({
            success: true,
            count: reviews.length,
            averageRating: Number(averageRating),
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Admin: Get all reviews
export const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("item", "name image price")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Admin: Delete review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
