import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
// ✅ FIX: 'Item' se 'item' (small 'i') kar diya hai
import { addItem, editItem } from "../controllers/item.controller.js"; 

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

export default itemRouter;