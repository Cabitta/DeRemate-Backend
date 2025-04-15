import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { envConfig } from "./utils/envConfig.js";
import { connectToMongoDB } from "./DB/dbConnection.js";

import Client from './models/Client.js';
import Delivery from './models/Delivery.js';
import Package from './models/Package.js';
import Route from './models/Route.js';

const app = express();
const PORT = envConfig.PORT || 3000;

app.use(
  cors({
    origin: envConfig.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


app.get("api/delivery-list", (req, res) => {
  res.status(200).json({
    message: "Hello from the server!",
  });
});
