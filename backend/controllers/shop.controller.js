import Shop from "../models/shop.model.js";
import uploadOnImageKit from "../utils/imagekitUpload.js"; // ✅ 1. Cloudinary hata kar ImageKit import kiya

export const createShop = async (req, res) => {
    try {
        const { name, city, state, address, shopCategory } = req.body;
        let image;

        // 1. Check karo ki image upload hui hai ya nahi
        if (req.file) {
            image = await uploadOnImageKit(req.file.path); // ✅ 2. Cloudinary ki jagah ImageKit call kiya
            // Agar upload fail ho gaya toh error message return kar do
            if (!image) {
                return res.status(500).json({ message: "Image upload failed" });
            }
        }

        // 2. FindOneAndUpdate use karo (Upsert = true matlab agar nahi mila toh create kar do)
        const shop = await Shop.findOneAndUpdate(
            { owner: req.userId }, // Condition: Find shop by current logged-in user's ID
            {
                name,
                city,
                state,
                address,
                shopCategory, // Aapne form mein shopCategory bhi bheja tha, usko add kiya
                image, // Agar image undefined hai toh update nahi hoga (mongodb undefined ignore karega)
                owner: req.userId
            },
            { 
                new: true,       // Return the updated document
                upsert: true,    // Agar shop nahi mili, toh nayi create kar do (create + update)
                setDefaultsOnInsert: true 
            }
        );

        // 3. Owner ko populate karo (details dikhane ke liye)
        await shop.populate("owner");

        // 4. Success Response
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

// ... (Upar createEditShop ka code aapka pehle se hi hoga) ...

// ✅ Corrected getMyShop Controller
export const getMyShop = async (req, res) => {
    try {
        // 1. Correct syntax: .populate("owner") alag parentheses mein
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner");

        // 2. Agar shop nahi mili, toh 404 error return karo (null nahi)
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found for this user. Please create a shop first."
            });
        }

        // 3. Success response bhejo
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