import express from "express";
import { createShop, getMyShop, getShopByCity, getAllShops, addItemToShop, deleteShop } from "../controllers/shop.controller.js";
import { upload } from "../middlewares/multer.js"; 
import isAuth from "../middlewares/isAuth.js";
import { isOwner } from "../utils/isOwner.js";

const router = express.Router();

// ✅ 1. Shop create/update karne ka route
router.post("/create-shop", isAuth, upload.single("image"), createShop);

// ✅ 2. Apni shop dekhne ka route
router.get("/my-shop", isAuth, getMyShop);

// ✅ 3. City ke hisaab se shops ka route
router.get("/city/:city", getShopByCity);

// ✅ 4. SAARI SHOPS ka route - PUBLIC (User ko bhi shops dikhni chahiye)
router.get("/all-shops", getAllShops); // ⚠️ isAuth, isOwner HATAO

// ✅ 5. Item add karne ka route (Owner/Admin ke liye)
router.post("/add-item", isAuth, isOwner, upload.single("image"), addItemToShop);

// ✅ 6. Shop delete karne ka route (Owner/Admin ke liye)
router.delete("/delete-shop/:shopId", isAuth, isOwner, deleteShop);

export default router;