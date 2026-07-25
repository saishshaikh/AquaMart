import express from "express";
import dotenv from "dotenv";
import mongoDbConnect from "./config/db.js";
dotenv.config();
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors"

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
  app.use(express.json()) //global middlware 
  app.use(cookieParser())
  app.use("/api/auth/",authRouter)

app.listen(port, () => {
    mongoDbConnect()
    console.log(`Server Started on Port ${port}`);
});