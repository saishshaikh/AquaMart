import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

console.log("USER ROUTE IMPORTED");

userRouter.get("/current", isAuth, getUser);

export default userRouter;