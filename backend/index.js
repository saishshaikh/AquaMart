import express from "express";
import dotenv from "dotenv";
import mongoDbConnect from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.status(200).json({ msg: "HELLO" });
});

app.listen(port, () => {
    mongoDbConnect()
    console.log(`Server Started on Port ${port}`);
});