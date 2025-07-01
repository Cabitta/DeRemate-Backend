import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { envConfig } from "./utils/envConfig.js";
import { connectToMongoDB } from "./DB/dbConnection.js";
import deliveryHistoryRoutes from "./routes/deliveryHistory.routes.js";
import authRoutes from "./routes/auth.routes.js";
import qrRoutes from "./routes/qrRoutes.js";
import availableRoutes from "./routes/availableRoutes.js";
import deliveryCodeRoutes from "./routes/deliveryCode.routes.js";
import swaggerUI from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
import passport from "passport";
import { configurePassport } from "./passport.config.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const PORT = envConfig.PORT || 3000;

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Configurar Passport
const configuredPassport = configurePassport();
app.use(configuredPassport.initialize());

// Configuración Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use("/api", deliveryHistoryRoutes);
app.use("/api", authRoutes);
app.use("/api", availableRoutes);
app.use("/api", qrRoutes);
app.use("/api", notificationRoutes);
app.use("/api", deliveryCodeRoutes);

app.listen(PORT, "0.0.0.0", () => {
  connectToMongoDB();
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;
