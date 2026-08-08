import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    configured: !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ),
});

// Test Cloudinary connection
cloudinary.api
    .ping()
    .then((result) => {
        console.log("✅ CLOUDINARY PING:", result);
    })
    .catch((error) => {
        console.error("❌ CLOUDINARY PING ERROR:", error.message);
    });

const uploadOnCloudinary = async (file) => {
    if (!file) {
        console.error("❌ No file path received by uploadOnCloudinary");
        return null;
    }

    try {
        console.log("📁 Uploading file:", file);

        const exists = fs.existsSync(file);
        console.log("📁 File exists:", exists);

        if (!exists) {
            throw new Error(`Temporary file does not exist: ${file}`);
        }

        const result = await cloudinary.uploader.upload(file, {
            resource_type: "image",
            folder: "aquamart/shops",
        });

        console.log("✅ CLOUDINARY UPLOAD SUCCESS");
        console.log("☁️ Cloudinary URL:", result.secure_url);

        return result.secure_url;

    } catch (error) {
        console.error("========== CLOUDINARY UPLOAD ERROR ==========");
        console.error("Message:", error.message);
        console.error("HTTP Code:", error.http_code);
        console.error("Name:", error.name);
        console.error("Full Error:", error);
        console.error("==============================================");

        return null;

    } finally {
        // Always delete temporary file after upload attempt
        if (file && fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
                console.log("🗑️ Temporary file deleted");
            } catch (deleteError) {
                console.error(
                    "❌ Failed to delete temporary file:",
                    deleteError.message
                );
            }
        }
    }
};

export default uploadOnCloudinary;