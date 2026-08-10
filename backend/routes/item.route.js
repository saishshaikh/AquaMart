import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { addItem, editItem, getItemByCity } from "../controllers/item.controller.js"; 

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

// ✅ Change this (Query parameter ke liye ':' hata diya)
itemRouter.get("/get-by-city", getItemByCity);

export default itemRouter;