import mongoose from "mongoose";
import { envConfig } from "../utils/envConfig.js";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(envConfig.DB_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.log("Error en la conexion a MongoDB", error.message);
  }
};
