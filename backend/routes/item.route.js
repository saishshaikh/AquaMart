import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
// ✅ getAllItems import kiya gaya hai (location boundary hatane ke liye)
import { addItem, editItem, getAllItems } from "../controllers/item.controller.js"; 

const itemRouter = express.Router();

// ✅ 1. Item add karne ka route
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);

// ✅ 2. Item edit karne ka route
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

// ✅ 3. ALL ITEMS Route (Location Restriction Removed)
// 🚀 Ab city check nahi hoga; har location ke user ko saare items dikhenge
itemRouter.get("/all-items", getAllItems);

export default itemRouter;