import express from "express";
// Controllers import karein (getShopByCity ko bhi import kiya hai)
import { createShop, getMyShop, getShopByCity } from "../controllers/shop.controller.js"; 
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

// ✅ 1. Shop Create / Edit karne ka route (POST with Image)
shopRouter.post("/create-shop", isAuth, upload.single("image"), createShop);

// ✅ 2. Logged-in user ki shop fetch karne ka route (GET)
shopRouter.get("/my-shop", isAuth, getMyShop);

// ✅ 3. City ke mutabiq shops fetch karne ka route (GET)
shopRouter.get("/get-by-city/:city", getShopByCity);

export default shopRouter;