import express from "express";
import jwt from "jsonwebtoken";
import { handleAiChat } from "../controllers/chat.controller.js";

const router = express.Router();

// Optional Auth Middleware for Chat
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded._id || decoded.userId;
        if (userId) {
          req.userId = userId;
          req.user = { _id: userId, id: userId, role: decoded.role || "user" };
        }
      } catch (err) {
        // Token invalid/expired - continue as guest
      }
    }
  } catch (error) {
    // Continue as guest
  }
  next();
};

router.post("/message", optionalAuth, handleAiChat);

export default router;
