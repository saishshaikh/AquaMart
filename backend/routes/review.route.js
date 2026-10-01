import express from "express";
import { 
    addReview, 
    getItemReviews, 
    getAllReviewsAdmin, 
    deleteReview 
} from "../controllers/review.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/add", isAuth, addReview);
router.get("/item/:itemId", getItemReviews);
router.get("/admin/all", isAuth, getAllReviewsAdmin);
router.delete("/admin/:id", isAuth, deleteReview);

export default router;
