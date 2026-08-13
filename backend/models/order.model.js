import mongoose from "mongoose";

// ==========================================
// 1. SUB-SCHEMA: Shop Order Items
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
        required: true,
        min: 1
    },
    itemName: {
        type: String,
        required: true
    },
    itemImage: {
        type: String
    }
}, { timestamps: true });

// ==========================================
// 2. SUB-SCHEMA: Shop Order
// ==========================================
const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    shopName: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    shopOrderItems: [shopOrderItemsSchema],
    shopStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

// ==========================================
// 3. MAIN SCHEMA: Order
// ==========================================
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userMobile: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    deliveryAddress: {
        text: { type: String, required: true },
        latitude: { type: Number },
        longitude: { type: Number },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        landmark: { type: String }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryCharges: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    shopOrders: [shopOrderSchema],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Order tracking timestamps
    orderPlacedAt: { type: Date, default: Date.now },
    confirmedAt: Date,
    processingAt: Date,
    shippedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: { type: String },
    trackingId: { type: String },
    estimatedDeliveryDate: { type: Date },

    // 🚀 NEW: Delivery Boy Details (Integrated into Order Model)
    deliveryDetails: {
        assignedTo: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "DeliveryBoy", // Reference to your DeliveryBoy model
            default: null 
        },
        assignedAt: { type: Date },
        acceptedAt: { type: Date },
        deliveredAt: { type: Date },
        deliveryBoyName: { type: String },
        deliveryBoyMobile: { type: String },
        deliveryNotes: { type: String }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// VIRTUALS
// ==========================================
orderSchema.virtual('totalItems').get(function() {
    let total = 0;
    this.shopOrders.forEach(shop => {
        shop.shopOrderItems.forEach(item => {
            total += item.quantity;
        });
    });
    return total;
});

orderSchema.virtual('summary').get(function() {
    return {
        orderId: this._id,
        totalAmount: this.totalAmount,
        totalItems: this.totalItems,
        status: this.status,
        shops: this.shopOrders.length
    };
});

// ==========================================
// MIDDLEWARES (🐛 FIXED)
// ==========================================

// ✅ FIXED: REMOVED 'next' parameter and 'next()' call
orderSchema.pre('save', function() {
    if (this.isModified('status')) {
        this.updateStatusTimestamps();
    }
});

// ✅ FIXED: Moved to async function, removed 'next'
orderSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();
    
    if (update.$set && update.$set.status) {
        const newStatus = update.$set.status;
        const timestampMap = {
            'confirmed': 'confirmedAt',
            'processing': 'processingAt',
            'shipped': 'shippedAt',
            'out_for_delivery': 'outForDeliveryAt',
            'delivered': 'deliveredAt',
            'cancelled': 'cancelledAt'
        };
        
        const timestampField = timestampMap[newStatus];
        if (timestampField) {
            update.$set[timestampField] = new Date();
        }

        if (newStatus === 'cancelled' || newStatus === 'delivered') {
            update.$set['shopOrders.$[elem].shopStatus'] = newStatus;
        }
    }
    
    this.setOptions({ runValidators: false });
});

// ==========================================
// HELPER METHOD (Encapsulated logic)
// ==========================================
orderSchema.methods.updateStatusTimestamps = function() {
    const statusTimestampMap = {
        'confirmed': 'confirmedAt',
        'processing': 'processingAt',
        'shipped': 'shippedAt',
        'out_for_delivery': 'outForDeliveryAt',
        'delivered': 'deliveredAt',
        'cancelled': 'cancelledAt'
    };
    
    const timestampField = statusTimestampMap[this.status];
    if (timestampField) {
        this[timestampField] = new Date();
    }
    
    if (this.status === 'cancelled' || this.status === 'delivered') {
        this.shopOrders.forEach(shop => {
            shop.shopStatus = this.status;
        });
    }
};

const Order = mongoose.model("Order", orderSchema);
export default Order;