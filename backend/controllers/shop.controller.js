import Shop from "../models/shop.model.js";
import uploadOnImageKit from "../utils/imagekitUpload.js";

// ✅ 1. Create or Update Shop Controller
export const createShop = async (req, res) => {
    try {
        const { name, city, state, address, shopCategory } = req.body;
        let image;

        // Check if image is uploaded
        if (req.file) {
            image = await uploadOnImageKit(req.file.path);
            if (!image) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // Find and update or insert shop
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

        // Populate owner details
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

// ✅ 2. Get My Shop Controller (With Items Populated)
export const getMyShop = async (req, res) => {
    try {
        // Populating both owner and items so frontend gets the full item objects (name, price, etc.)
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