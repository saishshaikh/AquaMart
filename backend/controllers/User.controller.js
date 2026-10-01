import User from "../models/user.model.js";

export const getUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request"
      });
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile || "",
      role: user.role || "user",
      city: user.city || "",
      state: user.state || "",
      address: user.address || "",
      pincode: user.pincode || "",
      activeOrderId: user.activeOrderId || null,
      deliveryStatus: user.deliveryStatus || "available",
      currentLocation: user.currentLocation || { lat: 0, lng: 0 },
      totalDeliveries: user.totalDeliveries || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return res.status(200).json({
      success: true,
      user: userData,
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
    const userId = req.userId || req.user?._id;
    const { city, address, state, pincode, latitude, longitude } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    const updateFields = {};
    if (city !== undefined) updateFields.city = city;
    if (address !== undefined) updateFields.address = address;
    if (state !== undefined) updateFields.state = state;
    if (pincode !== undefined) updateFields.pincode = pincode;
    if (latitude !== undefined && longitude !== undefined) {
      updateFields.currentLocation = { lat: latitude, lng: longitude };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { returnDocument: 'after' }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: updatedUser._id,
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      mobile: updatedUser.mobile || "",
      role: updatedUser.role || "user",
      city: updatedUser.city || "",
      state: updatedUser.state || "",
      address: updatedUser.address || "",
      pincode: updatedUser.pincode || "",
      activeOrderId: updatedUser.activeOrderId || null,
      deliveryStatus: updatedUser.deliveryStatus || "available",
      currentLocation: updatedUser.currentLocation || { lat: 0, lng: 0 },
      totalDeliveries: updatedUser.totalDeliveries || 0
    };

    return res.status(200).json({
      success: true,
      message: "Location/City updated successfully",
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