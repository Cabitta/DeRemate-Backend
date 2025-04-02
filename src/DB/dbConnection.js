import mongoose from "mongoose";
import { envConfig } from "../utils/envConfig.js";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(envConfig.DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error db connection", error.message);
  }
};
