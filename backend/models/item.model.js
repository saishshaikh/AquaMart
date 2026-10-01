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
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ""
    },
    stock: {
        type: Number,
        default: 100
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);