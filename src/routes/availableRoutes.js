import { Router } from "express";
import {
  getAllAvailableRoutes,
  setRouteState,
  getInTransitRouteByDeliveryId,
} from "../controllers/availableRoutesController.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = Router();

router.get("/routes/availables", protectDelivery, getAllAvailableRoutes);
router.put("/routes/set-state", protectDelivery, setRouteState);
router.get(
  "/routes/in-transit",
  protectDelivery,
  getInTransitRouteByDeliveryId
);

export default router;
