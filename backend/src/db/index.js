import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName:DB_NAME
      }
    );

    console.log(`✅ MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Stop the server if DB connection fails
  }
};

export default connectDB;
