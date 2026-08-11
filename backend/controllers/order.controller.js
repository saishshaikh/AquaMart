import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

// ==========================================
// 1. PLACE ORDER (Group by Shop Logic)
// ==========================================
export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress } = req.body;
        const userId = req.userId;
        const user = req.user;

        // VALIDATION 1: Check if cart is empty
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty. Please add items to place an order."
            });
        }

        // VALIDATION 2: Check if delivery address is complete
        if (!deliveryAddress || !deliveryAddress.text) {
            return res.status(400).json({
                success: false,
                message: "Please provide a complete delivery address."
            });
        }

        // VALIDATION 3: Check payment method
        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Please select a payment method."
            });
        }

        // STEP 1: Group Items by Shop ID
        const groupItemsByShop = {};

        for (const cartItem of cartItems) {
            const item = await Item.findById(cartItem._id).populate('shop');
            
            if (!item) {
                throw new Error(`Item with ID ${cartItem._id} not found.`);
            }

            if (!item.shop) {
                throw new Error(`Item ${item.name} has no shop associated.`);
            }

            const shopId = item.shop._id.toString();

            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = {
                    shop: item.shop,
                    items: []
                };
            }

            groupItemsByShop[shopId].items.push({
                itemId: item._id,
                name: item.name,
                price: item.price,
                quantity: cartItem.quantity,
                image: item.image || item.images?.[0] || item.imageUrl || null,
                shop: item.shop
            });
        }

        // STEP 2: Process each Shop's order
        const shopOrders = await Promise.all(
            Object.keys(groupItemsByShop).map(async (shopId) => {
                const group = groupItemsByShop[shopId];
                const shop = group.shop;

                const subtotal = group.items.reduce((sum, item) => {
                    return sum + (item.price * item.quantity);
                }, 0);

                const shopOrderItems = group.items.map((item) => ({
                    item: item.itemId,
                    price: item.price,
                    quantity: item.quantity,
                    name: item.name,
                    itemName: item.name,
                    image: item.image,       // Saved directly for clean access
                    itemImage: item.image    // Saved for backward compatibility
                }));

                return {
                    shop: shop._id,
                    shopName: shop.shopName || shop.name || 'Shop',
                    owner: shop.owner,
                    subtotal,
                    shopOrderItems,
                    shopStatus: 'pending'
                };
            })
        );

        // STEP 3: Calculate Total Amount
        const subtotalAmount = shopOrders.reduce((sum, order) => sum + order.subtotal, 0);
        const deliveryCharges = subtotalAmount > 500 ? 0 : 40;
        const tax = subtotalAmount * 0.05;
        const totalAmount = subtotalAmount + deliveryCharges + tax;

        // STEP 4: Create Main Order
        const newOrder = new Order({
            user: userId,
            userName: user.fullName || user.name || 'User',
            userEmail: user.email,
            userMobile: user.mobile || user.phone || '',
            paymentMethod,
            paymentStatus: 'pending',
            deliveryAddress: {
                text: deliveryAddress.text,
                latitude: deliveryAddress.latitude ?? null,
                longitude: deliveryAddress.longitude ?? null,
                city: deliveryAddress.city || '',
                state: deliveryAddress.state || '',
                pincode: deliveryAddress.pincode || '',
                landmark: deliveryAddress.landmark || ''
            },
            totalAmount,
            deliveryCharges,
            tax,
            discount: 0,
            shopOrders,
            status: 'pending',
            orderPlacedAt: new Date(),
            estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        });

        // STEP 5: Save to Database
        await newOrder.save();

        // STEP 6: Update item stock
        for (const shopGroup of Object.values(groupItemsByShop)) {
            for (const item of shopGroup.items) {
                await Item.findByIdAndUpdate(item.itemId, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // STEP 7: Success Response
        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: newOrder
        });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error while placing order."
        });
    }
};

// ==========================================
// 2. GET USER ORDERS (Fixed Population)
// ==========================================
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;

        const orders = await Order.find({ user: userId })
            .populate("shopOrders.shop", "shopName name image address")
            .populate("shopOrders.shopOrderItems.item", "name image images price imageUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders.",
            error: error.message
        });
    }
};

// ==========================================
// 3. GET SINGLE ORDER DETAILS
// ==========================================
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate("shopOrders.shop", "shopName name image address phone")
            .populate("shopOrders.shopOrderItems.item", "name image images price category imageUrl");

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found." 
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details.",
            error: error.message
        });
    }
};

// ==========================================
// 4. GET SHOP ORDERS (For Shop Owner)
// ==========================================
export const getShopOrders = async (req, res) => {
    try {
        const ownerId = req.userId;

        const orders = await Order.find({
            "shopOrders.owner": ownerId
        })
        .populate("user", "fullName name email phone")
        .populate("shopOrders.shop", "shopName name image address")
        .populate("shopOrders.shopOrderItems.item", "name image images price imageUrl")
        .sort({ createdAt: -1 });

        const filteredOrders = orders.map(order => {
            const filteredShopOrders = order.shopOrders.filter(
                shopOrder => shopOrder.owner.toString() === ownerId.toString()
            );
            return {
                ...order.toObject(),
                shopOrders: filteredShopOrders
            };
        });

        res.status(200).json({
            success: true,
            orders: filteredOrders
        });

    } catch (error) {
        console.error("Error fetching shop orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch shop orders.",
            error: error.message
        });
    }
};

// ==========================================
// 5. UPDATE SHOP ORDER STATUS (For Shop Owner)
// ==========================================
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const { status } = req.body;
        const ownerId = req.userId;

        const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found." 
            });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);

        if (!shopOrder) {
            return res.status(404).json({ 
                success: false, 
                message: "Shop order not found within this order." 
            });
        }

        if (shopOrder.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this shop order."
            });
        }

        shopOrder.shopStatus = status;

        const allShopStatuses = order.shopOrders.map(s => s.shopStatus);
        const allSame = allShopStatuses.every(s => s === status);
        if (allSame) {
            order.status = status;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Shop order status updated to ${status}`,
            order
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status.",
            error: error.message
        });
    }
};

// ==========================================
// 6. CANCEL ORDER (User)
// ==========================================
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const userId = req.userId;

        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const cancellableStatuses = ["pending", "confirmed", "processing"];
        if (!cancellableStatuses.includes(order.status?.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Order with status "${order.status}" cannot be cancelled.`
            });
        }

        for (const shopOrder of order.shopOrders) {
            for (const item of shopOrder.shopOrderItems) {
                await Item.findByIdAndUpdate(item.item, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    status: "cancelled",
                    cancellationReason: reason || "Cancelled by user",
                    cancelledAt: new Date(),
                    "shopOrders.$[elem].shopStatus": "cancelled"
                }
            },
            {
                arrayFilters: [{ "elem.shopStatus": { $ne: "cancelled" } }],
                new: true,
                runValidators: false
            }
        );

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel order.",
            error: error.message
        });
    }
};

// ==========================================
// 7. GET ORDER STATISTICS (Admin/Owner)
// ==========================================
export const getOrderStatistics = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        
        const statusStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const revenueStats = await Order.aggregate([
            {
                $match: { status: 'delivered' }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const paymentStats = await Order.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            statistics: {
                totalOrders,
                recentOrders,
                statusBreakdown: statusStats,
                paymentBreakdown: paymentStats,
                revenue: revenueStats[0] || { 
                    totalRevenue: 0, 
                    averageOrderValue: 0,
                    totalOrders: 0 
                },
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error("Error fetching order statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order statistics.",
            error: error.message
        });
    }
};

// ==========================================
// 8. GET ORDER BY ID (Admin/Owner)
// ==========================================
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("user", "fullName name email phone")
            .populate("shopOrders.shop", "shopName name image address phone")
            .populate("shopOrders.shopOrderItems.item", "name image images price category imageUrl");

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found." 
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order.",
            error: error.message
        });
    }
};