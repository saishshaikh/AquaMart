import Shop from "../models/shop.model.js";
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
                new: true,      
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
// ✅ 3. GET ALL SHOPS (For Admin Dashboard)
// ==========================================
export const getAllShops = async (req, res) => { 
    try {
        const ownerId = req.userId;

        const shops = await Shop.find({ owner: ownerId })
            .populate("items")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
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
// 4. GET SHOPS BY CITY
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