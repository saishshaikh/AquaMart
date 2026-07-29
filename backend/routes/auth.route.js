import express from "express";

import {
  signup,
  signin,
  signout,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleAuth,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/signout", signout);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google", googleAuth);

export default authRouter;