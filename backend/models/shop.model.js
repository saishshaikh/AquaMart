import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        default: 4.8
    },
    totalRatings: {
        type: Number,
        default: 12
    },
    // 🟢 Shop ki category (Dry Fish, Fresh Fish etc.)
    shopCategory: {
        type: String,
        default: "Fresh Seafood",
        trim: true
    },
    // 🟡 Items ka array
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }]
}, { timestamps: true });

export default mongoose.model("Shop", shopSchema);