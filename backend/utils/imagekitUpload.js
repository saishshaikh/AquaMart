import ImageKit from 'imagekit';
import fs from "fs";

// ✅ Safe ImageKit Helper
const getImageKitInstance = () => {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        console.warn("⚠️ ImageKit environment variables missing (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT). Image upload to ImageKit will be skipped.");
        return null;
    }

    try {
        return new ImageKit({ publicKey, privateKey, urlEndpoint });
    } catch (err) {
        console.error("⚠️ Failed to initialize ImageKit:", err.message);
        return null;
    }
};


const uploadOnImageKit = async (file) => {
    try {
        if (!file) return null;

        const imagekit = getImageKitInstance();
        if (!imagekit) {
            console.log("ℹ️ Skipping ImageKit upload (keys not provided). Returning fallback placeholder image.");
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
            return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600";
        }

        console.log("📁 Uploading file to ImageKit:", file);

        // ImageKit par upload
        const result = await imagekit.upload({
            file: fs.createReadStream(file),
            fileName: `aquamart-${Date.now()}.jpg`,
            folder: "/aquamart"
        });

        console.log("✅ ImageKit Upload Success:", result.url);

        // Local file delete karo
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        // ✅ URL clean karo, endpoint fix karo, aur fallback add karo
        let finalUrl = result.url.trim();
        
        finalUrl = finalUrl.replace("ik.imagekit.io/7ykxzcex8l", "ik.imagekit.io/7ykxzcex8l/aquamart-images");

        if (!finalUrl.includes("?tr=")) {
            finalUrl += "?tr=w-600";
        }

        console.log("✅ Final Image URL:", finalUrl);

        return finalUrl;

    } catch (error) {
        console.error("❌ ImageKit Upload Error:", error);
        
        if (file && fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    }
};

export default uploadOnImageKit;