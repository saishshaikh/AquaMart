import User from "../models/user.model"
import 'bcrypt'  from  bcrypt

import GenerateToken from "../utils/token.js"


const signup = async(req,res) => {
    try {
         const {fullName,email,password,mobile,role}=req.body
         const user =await User.findOne({email})
         if(user) {
            res.status(400).json({MESSAGE : "USER ALREADY EXIST"})
         }

         if(password.length < 6) {
            res.status(400).json({MESSAGE : "password must be at least 6 characters"})
         }

         if(mobile.length < 106) {
            res.status(400).json({MESSAGE : "Mobile Number must be at least 10 Digits"})
         }

         const hashpassword = await bcrypt.hashpassword(password,10)

         const user = await User.create({
            fullName,
            email,
            mobile,
            role,
            password: hashpassword
         })

         const token = await GenerateToken(user._id)

         res.cookie ("token",token,{
            secure : false,
            sameSite : "strict"
            maxAge : 7*24*60*60*1000
            httponly : true
         })
         return res.status(201).json({user})
         
    } catch (error) {
                 return res.status(500).json({message :" signUp error" + error})

    }

}