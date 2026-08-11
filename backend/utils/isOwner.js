import User from "../models/user.model.js";

export const isOwner = async (req, res, next) => {
    try {
        // 1. isAuth se aaya userId lo
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized: User ID not found." 
            });
        }

        // 2. Database se user fetch karo
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found." 
            });
        }

        // 3. Role check karo (owner ya admin hone chahiye)
        if (user.role !== "owner" && user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only Shop Owners/Admins can perform this action." 
            });
        }

        // 4. Sab sahi hai, next middleware / controller ko call karo
        next();
        
    } catch (error) {
        console.error("❌ isOwner Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error while checking ownership.",
            error: error.message 
        });
    }
};