import { Router } from "express";
import { getAvailableRoutesByDeliveryId } from "../controllers/availableRoutesController.js";
import { authRequired } from "../middlewares/validartoken.js";

const router = Router();

router.get(
  "/available-routes/:deliveryId",
  authRequired,
  getAvailableRoutesByDeliveryId
);