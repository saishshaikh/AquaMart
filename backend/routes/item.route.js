import express from "express";
import { addItem, editItem } from "../controllers/item.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../utils/multer.js";

const itemRouter = express.Router();

// 🐟 Add new item route
itemRouter.post("/add", isAuth, upload.single("image"), addItem);

// ✏️ Edit existing item route (using itemId as a parameter)
itemRouter.put("/edit/:itemId", isAuth, upload.single("image"), editItem);

export default itemRouter;