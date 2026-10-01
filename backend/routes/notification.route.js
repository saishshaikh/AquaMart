import express from "express";
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead 
} from "../controllers/notification.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/my-notifications", isAuth, getUserNotifications);
router.put("/read/:id", isAuth, markAsRead);
router.put("/read-all", isAuth, markAllAsRead);

export default router;
