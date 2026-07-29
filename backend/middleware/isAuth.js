// middleware/isAuth.js
import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        // Cookie ya Authorization header se token lo
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        console.log("🔐 Token received:", token ? "YES" : "NO");

        // Token check
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Please login."
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ Decoded token:", decoded);

        // Token me id hai
        req.userId = decoded.id;

        console.log("👤 User ID set in request:", req.userId);

        // Next controller
        next();

    } catch (error) {
        console.error("❌ Auth Error:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};

export default isAuth;