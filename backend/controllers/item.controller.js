import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnImageKit from "../utils/imagekitUpload.js"; 

// ==========================================
// 1. ADD ITEM CONTROLLER
// ==========================================
export const addItem = async (req, res) => {
    try {
        const { name, category, price } = req.body;
        let image;

        if (req.file) {
            image = await uploadOnImageKit(req.file.path);
            if (!image) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(400).json({ success: false, message: "Shop not found for this user. Please create a shop first." });
        }

        const item = await Item.create({
            name,
            category,
            price,
            image,
            shop: shop._id
        });

        const updatedShop = await Shop.findByIdAndUpdate(
            shop._id,
            { $push: { items: item._id } },
            { new: true }
        ).populate("items");

        return res.status(201).json({
            success: true,
            message: "Item added successfully",
            item,
            shop: updatedShop 
        });

    } catch (error) {
        console.error("Error in addItem:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// ==========================================
// 2. EDIT ITEM CONTROLLER
// ==========================================
export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, category, price } = req.body;
        let image;

        if (req.file) {
            image = await uploadOnImageKit(req.file.path);
            if (!image) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        const updateData = { name, category, price };
        if (image) {
            updateData.image = image;
        }

        const item = await Item.findByIdAndUpdate(
            itemId, 
            updateData, 
            { new: true }
        );

        if (!item) {
            return res.status(400).json({ success: false, message: "Item not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item
        });

    } catch (error) {
        console.error("Error in editItem:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ==========================================
// 3. DELETE ITEM CONTROLLER (NEW ADDED)
// ==========================================
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        
        const item = await Item.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(400).json({ success: false, message: "Item not found" });
        }

        // Shop ke items array se bhi delete karo
        await Shop.findByIdAndUpdate(
            item.shop,
            { $pull: { items: itemId } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Item deleted successfully",
            item
        });

    } catch (error) {
        console.error("Error in deleteItem:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ==========================================
// 4. GET ALL ITEMS CONTROLLER (No City Boundary)
// ==========================================
export const getAllItems = async (req, res) => {
    try {
        const items = await Item.find({
            name: { $exists: true, $ne: "" },
            price: { $gt: 0 }
        }).populate("shop", "name city address");

        return res.status(200).json({
            success: true,
            count: items.length,
            items
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: `Error fetching all items: ${error.message}` 
        });
    }
};