import User from "../models/user.model.js";

export const getUser = async (req, res) => {
  try {
    console.log("👤 Getting user with ID:", req.userId);
    
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request"
      });
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User found:", user.email);
    console.log("✅ User role:", user.role); // Debug log
    console.log("✅ Full user object:", user); // Debug log
    
    // Ensure all fields are included, set defaults if missing
    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role || 'user', // Set default if role is missing
      city: user.city || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return res.status(200).json({
      success: true,
      user: userData, // Send the structured user data
    });

  } catch (error) {
    console.error("❌ Get User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCity = async (req, res) => {
  try {
    const userId = req.userId || req.id || req.user?._id;
    const { city } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { city },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ City updated successfully to:", city);

    // Return structured user data with role
    const userData = {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      role: updatedUser.role || 'user',
      city: updatedUser.city || '',
    };

    return res.status(200).json({
      success: true,
      message: "City updated successfully",
      user: userData,
    });

  } catch (error) {
    console.error("❌ Update City Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};