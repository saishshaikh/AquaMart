import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";

// ==========================================
// 1. PLACE ORDER (Group by Shop Logic)
// ==========================================
export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress } = req.body;
        const userId = req.userId;

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
                message: "Please provide a complete delivery address (Text is required)."
            });
        }

        // VALIDATION 3: Check payment method is provided
        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Please select a payment method."
            });
        }

        // STEP 1: Group Items by Shop ID
        const groupItemsByShop = {};

        cartItems.forEach((item) => {
            const shopId = item.shop; // every item must have a 'shop' field

            if (!shopId) {
                throw new Error("One or more cart items are missing a shop reference.");
            }

            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item);
        });

        // STEP 2: Process each Shop's order
        const shopOrders = await Promise.all(
            Object.keys(groupItemsByShop).map(async (shopId) => {
                const items = groupItemsByShop[shopId];

                const shop = await Shop.findById(shopId).populate("owner", "_id");

                if (!shop) {
                    throw new Error(`Shop with ID ${shopId} not found.`);
                }

                // Calculate subtotal for this shop (no arbitrary multiplier)
                const subtotal = items.reduce((sum, item) => {
                    const price = Number(item.price);
                    const quantity = Number(item.quantity);

                    if (Number.isNaN(price) || Number.isNaN(quantity) || price < 0 || quantity <= 0) {
                        throw new Error(`Invalid price/quantity for item in shop ${shopId}.`);
                    }

                    return sum + price * quantity;
                }, 0);

                const shopOrderItems = items.map((item) => ({
                    item: item._id,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                }));

                return {
                    shop: shop._id,
                    owner: shop.owner._id,
                    subtotal,
                    shopOrderItems,
                    status: "pending",
                };
            })
        );

        // STEP 3: Calculate Total Amount
        const totalAmount = shopOrders.reduce((sum, order) => sum + order.subtotal, 0);

        // STEP 4: Create Main Order
        // FIX: use ?? instead of || so a valid 0 latitude/longitude isn't wiped out to null
        const newOrder = new Order({
            user: userId,
            paymentMethod,
            deliveryAddress: {
                text: deliveryAddress.text,
                latitude: deliveryAddress.latitude ?? null,
                longitude: deliveryAddress.longitude ?? null,
            },
            totalAmount,
            shopOrders,
        });

        // STEP 5: Save to Database
        await newOrder.save();

        // STEP 6: Success Response
        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: newOrder,
        });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error while placing order.",
        });
    }
};

// ==========================================
// 2. GET USER ORDERS
// ==========================================
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;

        const orders = await Order.find({ user: userId })
            .populate("shopOrders.shop", "name image")
            .populate("shopOrders.shopOrderItems.item", "name image price")
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
            .populate("shopOrders.shop", "name image address")
            .populate("shopOrders.shopOrderItems.item", "name image price category");

        // FIX: consistent success:false on not-found
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
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
        .populate("user", "fullName email phone")
        .populate("shopOrders.shop", "name image")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .sort({ createdAt: -1 });

        const filteredOrders = orders.map(order => {
            const filteredShopOrders = order.shopOrders.filter(
                shopOrder => shopOrder.owner.toString() === ownerId.toString()
            );
            return {
                ...order._doc,
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
// 5. UPDATE ORDER STATUS
// ==========================================
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const { status } = req.body;

        // FIX: validate status against allowed values instead of trusting client blindly
        const allowedStatuses = ["pending", "accepted", "preparing", "out for delivery", "delivered", "cancelled"];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // FIX: use Mongoose's subdocument .id() accessor instead of mapping to
        // plain objects with toObject(). The old approach discarded the subdocument
        // (losing its own save/validation hooks) and relied on markModified as a
        // workaround. .id() gives back the actual subdocument so you can mutate it
        // directly and Mongoose tracks the change automatically.
        const shopOrder = order.shopOrders.id(shopOrderId);

        if (!shopOrder) {
            return res.status(404).json({ success: false, message: "Shop order not found within this order." });
        }

        shopOrder.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
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