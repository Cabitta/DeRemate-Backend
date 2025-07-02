import express from "express";
import {
  getDeliveryHistoryList,
  getDeliveryDetails,
} from "../controllers/deliveryHistoryController.js";
import { authRequired } from "../middlewares/validartoken.js";
import { responseTimeMiddleware } from "../middlewares/responseTimeMiddleware.js";

const router = express.Router();
router.use(responseTimeMiddleware);

router.get("/delivery-history-list", authRequired, getDeliveryHistoryList);
router.get("/delivery-details/:routeId", authRequired, getDeliveryDetails);

export default router;
