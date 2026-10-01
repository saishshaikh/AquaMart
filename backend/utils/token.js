// utils/GenerateToken.js
import jwt from "jsonwebtoken";

const GenerateToken = (userId, role = "user") => {
    try {
        const token = jwt.sign(
            { id: userId, role: role || "user" },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );
        return token;
    } catch (error) {
        console.error("GENERATE TOKEN ERROR: " + error);
        return null;
    }
};

export { GenerateToken };
export default GenerateToken;