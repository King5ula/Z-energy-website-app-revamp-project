import mongoose from "mongoose";
import { config } from "../config/env.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
