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
    // 🟢 Shop ki category (Dry Fish, Fresh Fish etc.)
    shopCategory: {
        type: String,
        enum: ["Fresh Fish Market", "Dry Fish Store", "Seafood Speciality", "Aqua Mart", "Other"],
        required: true
    },
    // 🟡 Items ka array (Screenshot wala line)
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }]
}, { timestamps: true });

export default mongoose.model("Shop", shopSchema);