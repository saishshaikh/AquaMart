import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// ==========================================
// 1. ADD ITEM CONTROLLER
// ==========================================
export const addItem = async (req, res) => {
    try {
        const { name, category, price } = req.body; // ✅ 'foodType' hata kar 'category' rakha
        let image;

        // Image upload logic
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
            if (!image) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // Check karo user ki shop exist karti hai ya nahi
        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(400).json({ success: false, message: "Shop not found for this user. Please create a shop first." });
        }

        // Item create karo (Capital 'I' use karo)
        const item = await Item.create({
            name,
            category, // ✅ Sahi field
            price,
            image,
            shop: shop._id
        });

        return res.status(201).json({
            success: true,
            message: "Item added successfully",
            item
        });

    } catch (error) {
        console.error("Error in addItem:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// ==========================================
// 2. EDIT ITEM CONTROLLER
// ==========================================
export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, category, price } = req.body; // ✅ 'foodType' hata kar 'category' rakha
        let image;

        // ✅ Image logic fix: Agar nayi file upload hui hai, toh upload karo
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
            if (!image) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // Update object prepare karo
        const updateData = { name, category, price };
        
        // ✅ Agar nayi image upload hui hai, tabhi update object mein add karo
        if (image) {
            updateData.image = image;
        }

        // Item find karo aur update karo
        const item = await Item.findByIdAndUpdate(
            itemId, 
            updateData, 
            { new: true } // Updated item return karega
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