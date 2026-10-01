import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getUser, updateCity } from "../controllers/user.controller.js";

const userRouter = express.Router();

console.log("USER ROUTE IMPORTED");

userRouter.get("/current", isAuth, getUser);

// 📍 City & Location update routes
userRouter.post("/update-city", isAuth, updateCity);
userRouter.post("/update-location", isAuth, updateCity);

export default userRouter;