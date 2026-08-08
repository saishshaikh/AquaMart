import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getUser, updateCity } from "../controllers/user.controller.js";

const userRouter = express.Router();

console.log("USER ROUTE IMPORTED");

userRouter.get("/current", isAuth, getUser);

// 📍 Yeh naya route add karna hai taaki 404 error na aaye
userRouter.post("/update-city", isAuth, updateCity);

export default userRouter;