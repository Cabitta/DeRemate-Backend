import { Router } from "express";
import { getAvailableRoutesByDeliveryId } from "../controllers/availableRoutesController.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = Router();

router.get(
  "/available-routes",
  //protectDelivery, TODO: Uncomment this line when the protectDelivery middleware is ready
  getAvailableRoutesByDeliveryId
);

export default router;