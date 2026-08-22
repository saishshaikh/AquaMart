import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js"; // ✅ Item Model Import Karna Zaroori Hai
import uploadOnImageKit from "../utils/imagekitUpload.js";

// ==========================================
// 1. CREATE OR UPDATE SHOP
// ==========================================
export const createShop = async (req, res) => {
    try {
        const { name, city, state, address, shopCategory } = req.body;
        let image;

        if (req.file) {
            image = await uploadOnImageKit(req.file.path);
            if (!image) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        const shop = await Shop.findOneAndUpdate(
            { owner: req.userId }, 
            {
                name,
                city,
                state,
                address,
                shopCategory,
                image,
                owner: req.userId
            },
            { 
                returnDocument: 'after', // ✅ Deprecated 'new' ki jagah yeh use karo
                upsert: true,    
                setDefaultsOnInsert: true 
            }
        );

        await shop.populate("owner");

        return res.status(201).json({
            success: true,
            message: "Shop created/updated successfully",
            shop
        });

    } catch (error) {
        console.error("Error in createShop controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ==========================================
// 2. GET SINGLE SHOP (For Owner Dashboard)
// ==========================================
export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
            .populate("owner")
            .populate("items");

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found for this user. Please create a shop first."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Shop fetched successfully",
            shop
        });

    } catch (error) {
        console.error("Error in getMyShop:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching shop"
        });
    }
};

// ==========================================
// ✅ 3. GET ALL SHOPS (For Admin Dashboard - ALL LOCATIONS & ALL OWNERS)
// ==========================================
export const getAllShops = async (req, res) => { 
    try {
        // 🚀 Ab koi filter nahi, bas saari shops fetch karni hain
        const shops = await Shop.find({})
            .populate("owner")   // Owner ka naam bhi dikhega
            .populate("items")   // Saare items bhi dikhenge
            .sort({ createdAt: -1 }); // Sabse nayi shop sabse upar

        return res.status(200).json({
            success: true,
            count: shops.length, // ✅ Kitni shops mili, yeh bhi dikhega
            shops
        });

    } catch (error) {
        console.error("❌ Error fetching all shops:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch shops. Please try again."
        });
    }
};

// ==========================================
// ✅ 4. ADD ITEM TO SHOP (For Admin Dashboard)
// ==========================================
export const addItemToShop = async (req, res) => {
    try {
        const { name, price, category, description, shopId } = req.body;
        
        // Shop check karo
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        let image;
        if (req.file) {
            image = await uploadOnImageKit(req.file.path);
        }

        // Item create karo
        const item = await Item.create({
            name, price, category, description, image, shop: shopId
        });

        // Shop mein item push karo
        await Shop.findByIdAndUpdate(shopId, { $push: { items: item._id } });

        return res.status(201).json({ success: true, message: "Item added successfully", item });

    } catch (error) {
        console.error("❌ Error in addItemToShop:", error);
        return res.status(500).json({ success: false, message: "Failed to add item" });
    }
};

// ==========================================
// ✅ 5. DELETE SHOP (For Admin Dashboard)
// ==========================================
export const deleteShop = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        const shop = await Shop.findByIdAndDelete(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        // Saare items delete karo jo shop ke the
        await Item.deleteMany({ shop: shopId });

        return res.status(200).json({ success: true, message: "Shop deleted successfully" });

    } catch (error) {
        console.error("❌ Error in deleteShop:", error);
        return res.status(500).json({ success: false, message: "Failed to delete shop" });
    }
};

// ==========================================
// 6. GET SHOPS BY CITY
// ==========================================
export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params;

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        });

        if (!shops || shops.length === 0) {
            return res.status(404).json({ success: false, message: "No shops found in this city" });
        }

        return res.status(200).json({ success: true, shops });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Get shop by city error: ${error.message}` });
    }
};