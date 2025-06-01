import { Router } from "express";
import { getAvailableRoutesByDeliveryId } from "../controllers/availableRoutesController.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = Router();

router.get(
  "/available-routes",
  protectDelivery, // Now using Passport JWT strategy
  getAvailableRoutesByDeliveryId
);

export default router;
