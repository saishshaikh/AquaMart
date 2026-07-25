import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/token.js";


const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                MESSAGE: "USER ALREADY EXIST"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                MESSAGE: "Password must be at least 6 characters"
            });
        }

        if (mobile.length < 10) {
            return res.status(400).json({
                MESSAGE: "Mobile Number must be at least 10 digits"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            mobile,
            role,
            password: hashPassword,
        });


        const token = GenerateToken(user._id);

        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });


        return res.status(201).json({
            message: "Signup Successful",
            user
        });


    } catch (error) {
        return res.status(500).json({
            message: "SignUp Error: " + error.message,
        });
    }
};



const signin = async (req, res) => {
    try {

        const { email, password } = req.body;


        const user = await User.findOne({ email });


        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }


        const isMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }


        const token = GenerateToken(user._id);


        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.status(200).json({
            message: "Login Successful",
            user,
        });


    } catch (error) {

        return res.status(500).json({
            message: "SignIn Error: " + error.message,
        });

    }
};



const signout = async (req, res) => {
    try {

        res.clearCookie("token");


        return res.status(200).json({
            message: "Logout Successful",
        });


    } catch (error) {

        return res.status(500).json({
            message: "Logout Error",
        });

    }
};



export { signup, signin, signout };