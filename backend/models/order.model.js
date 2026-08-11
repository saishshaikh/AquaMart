import mongoose from "mongoose";

// ==========================================
// 1. SUB-SCHEMA: Shop Order Items (Individual items inside a shop order)
// ==========================================
const shopOrderItemsSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// ==========================================
// 2. SUB-SCHEMA: Shop Order (Orders belonging to a specific shop)
// ==========================================
const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    shopOrderItems: [shopOrderItemsSchema]
}, { timestamps: true });

// ==========================================
// 3. MAIN SCHEMA: Order (The main order placed by the user)
// ==========================================
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    deliveryAddress: {
        text: {
            type: String,
            required: true
        },
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    shopOrders: [shopOrderSchema] // Array of shop-wise orders
}, { timestamps: true });

// ==========================================
// 4. EXPORT MODEL
// ==========================================
const Order = mongoose.model("Order", orderSchema);
export default Order;