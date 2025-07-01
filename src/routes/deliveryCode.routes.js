import { Router } from "express";
import { generateCode, validateCode, getCodeStatus } from "../controllers/deliveryCodeController.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = Router();

// Generar y enviar código al cliente (cuando se escanea QR)
router.post(
  "/delivery-codes/generate", 
  protectDelivery, 
  generateCode
);

// Validar código ingresado por delivery (al entregar)
router.post(
  "/delivery-codes/validate", 
  protectDelivery, 
  validateCode
);

// Obtener estado del código de una ruta
router.get(
  "/delivery-codes/status/:routeId", 
  protectDelivery, 
  getCodeStatus
);

export default router;