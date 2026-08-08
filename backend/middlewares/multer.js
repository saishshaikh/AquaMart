import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES modules ke liye __dirname ka alternate tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Storage configure karein
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 'public' folder ka path set karein
        const uploadPath = path.join(__dirname, "../../public"); 

        // Agar 'public' folder exist nahi karta, toh use create kar dein
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp + original extension (e.g. 1712345678900_image.jpg)
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// 2. Multer instance export karein
export const upload = multer({ storage });