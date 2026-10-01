import express from "express";
import { 
    applyCoupon, 
    getActiveCoupons, 
    createCoupon, 
    getAllCouponsAdmin, 
    deleteCoupon 
} from "../controllers/coupon.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/apply", isAuth, applyCoupon);
router.get("/active", getActiveCoupons);
router.post("/create", isAuth, createCoupon);
router.get("/admin/all", isAuth, getAllCouponsAdmin);
router.delete("/admin/:id", isAuth, deleteCoupon);

export default router;
