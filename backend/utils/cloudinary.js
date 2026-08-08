import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

const uploadOnCloudinary = async (file) => {
    // Cloudinary configuration directly from .env file
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        // Agar file path nahi aaya toh return null
        if (!file) return null;

        // File ko Cloudinary par upload karein
        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto" // Auto detect image/video
        });

        // Upload ho jane ke baad, local server ki temporary file delete karein
        fs.unlinkSync(file);

        // Secure URL return karein
        return result.secure_url;

    } catch (error) {
        // Agar koi error aata hai, toh bhi temp file delete karein (server clean rakhne ke liye)
        fs.unlinkSync(file);
        
        // Error log karein
        console.error("Cloudinary Upload Error:", error);
        
        // Error hone par null return karein
        return null;
    }
};

export default uploadOnCloudinary;