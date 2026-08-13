import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import mongoDbConnect from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";

// ✅ IMPORT ROUTES
import shopRoutes from "./routes/shop.route.js";
import itemRouter from "./routes/item.route.js";
import orderRouter from "./routes/order.routes.js";
import deliveryRouter from "./routes/deliveryBoy.routes.js"; // ✅ NEW: Delivery Boy Routes Imported

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ REGISTER ROUTES
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRoutes);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/delivery", deliveryRouter); // ✅ NEW: Delivery Routes Registered Here

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(port, () => {
  mongoDbConnect();
  console.log(`Server Started on Port ${port}`);
});