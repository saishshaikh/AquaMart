import jwt from "jsonwebtoken";

const GenerateToken = (userId) => {
    try {
        const token = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return token;
    } catch (error) {
        console.log("GENERATE TOKEN ERROR"+ error);
    }
};

export default GenerateToken;