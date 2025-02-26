// dbConfig.ts
import mongoose from "mongoose";
require("dotenv").config();

export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    console.log("Connecting to MongoDB with URI:", MONGODB_URI);

    if (mongoose.connection.readyState === 1) return; // Already connected

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;