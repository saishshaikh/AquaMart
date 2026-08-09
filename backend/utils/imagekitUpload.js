import ImageKit from 'imagekit';
import fs from "fs";

// ✅ ImageKit Config
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadOnImageKit = async (file) => {
    try {
        if (!file) return null;

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

        // ✅ ULTIMATE FIX: URL clean karo, endpoint fix karo, aur fallback add karo
        let finalUrl = result.url.trim();
        
        // Agar purana endpoint use ho raha hai, toh naye endpoint se replace karo
        finalUrl = finalUrl.replace("ik.imagekit.io/7ykxzcex8l", "ik.imagekit.io/7ykxzcex8l/aquamart-images");

        // Agar URL mein extension hai lekin load nahi ho raha, toh ?tr=w-600 add karo
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
        return null;
    }
};

export default uploadOnImageKit;