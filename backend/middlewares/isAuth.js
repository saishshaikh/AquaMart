import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(" ")[1];

    console.log("🔐 Token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No Token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Decoded:", decoded);

    req.userId = decoded.id;

    console.log("👤 req.userId:", req.userId);

    next();
  } catch (error) {
    console.log("❌ Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default isAuth;