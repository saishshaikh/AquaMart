import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    // 🟢 BEST FIX: Item ki category enum set kar di
    category: {
        type: String,
        enum: ["Fresh Fish", "Dry Fish", "Prawns", "Crabs", "Lobsters", "Oysters", "Other Seafood"],
        required: true
    },
    price : {
        type: Number,
        reqired : true
    }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);