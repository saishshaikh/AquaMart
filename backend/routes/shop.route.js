import express from "express";
// Controllers import karein
import { createShop, getMyShop } from "../controllers/shop.controller.js"; 
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

// ✅ 1. Shop Create / Edit karne ka route (POST with Image)
shopRouter.post("/create-shop", isAuth, upload.single("image"), createShop);

// ✅ 2. Logged-in user ki shop fetch karne ka route (GET)
shopRouter.get("/my-shop", isAuth, getMyShop);

export default shopRouter;