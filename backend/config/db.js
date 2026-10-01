
import mongoose from "mongoose";

const mongoDbConnect = async ()=> {
    try {
      const url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/aquamart";
      await mongoose.connect(url);
      console.log("DATABASE CONNECTED...");
    } catch (error) {
        console.log("DATABASE ERROR !!" + error);
    }
}

export default mongoDbConnect;