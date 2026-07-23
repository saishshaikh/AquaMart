
import mongoose from "mongoose";

const mongoDbConnect = async ()=> {
    try {
      await   mongoose.connect(process.env.MONGODB_URL)
      console.log ("DATABASE CONNECTED...")
    } catch (error) {
        console.log("DATABASE ERROR !!"  + error)
    }
}


export default mongoDbConnect 