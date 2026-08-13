import express from "express";
import { createShop, getMyShop, getShopByCity, getAllShops } from "../controllers/shop.controller.js";
import { upload } from "../middlewares/multer.js"; // ✅ FIXED: .middleware removed, just .js
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/create-shop", isAuth, upload.single("image"), createShop);
router.get("/my-shop", isAuth, getMyShop);
router.get("/city/:city", getShopByCity);
router.get("/all-shops", isAuth, getAllShops);

export default router;