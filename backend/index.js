import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import mongoDbConnect from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";

// ✅ IMPORT NEW ROUTES (Saare import bilkul sahi hain)
import shopRoutes from "./routes/shop.route.js"; // ✅ singular 'route' use kiya hai
import itemRouter from "./routes/item.route.js";

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

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// ✅ REGISTER SHOP & ITEM ROUTES
app.use("/api/shop", shopRoutes);
app.use("/api/item", itemRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(port, () => {
  mongoDbConnect();
  console.log(`Server Started on Port ${port}`);
});