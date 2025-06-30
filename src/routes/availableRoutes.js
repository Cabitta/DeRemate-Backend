import { Router } from "express";
import { getAvailableRoutesByDeliveryId, setRouteState } from "../controllers/availableRoutesController.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = Router();

router.get(
  "/available-routes",
  protectDelivery,
  getAvailableRoutesByDeliveryId
);

router.put(
  "/available-routes/set-state",
  protectDelivery,
  setRouteState
)

export default router;
