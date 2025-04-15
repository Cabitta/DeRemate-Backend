import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { envConfig } from "./utils/envConfig.js";
import { connectToMongoDB } from "./DB/dbConnection.js";

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


app.get("/", (req, res) => {
  res.send("API is running...");
});
