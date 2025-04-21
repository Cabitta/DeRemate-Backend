import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { envConfig } from "./utils/envConfig.js";
import { connectToMongoDB } from "./DB/dbConnection.js";
import deliveryHistoryRoutes from "./routes/deliveryHistory.routes.js";
import authRoutes from "./routes/auth.routes.js";
import availableRoutes from "./routes/availableRoutes.js";
import swaggerUI from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";

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

// Configuración Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use("/api", deliveryHistoryRoutes);
app.use("/api", authRoutes);
app.use("/api", availableRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;
