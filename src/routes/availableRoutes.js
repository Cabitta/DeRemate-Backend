import { Router } from "express";
import { getAvailableRoutesByDeliveryId } from "../controllers/availableRoutesController.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = Router();

router.get(
  "/available-routes/:deliveryId",
  //protectDelivery,
  getAvailableRoutesByDeliveryId
);

export default router;