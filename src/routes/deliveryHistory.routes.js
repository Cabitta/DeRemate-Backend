import express from "express";
import Route from "../models/route.js";
import routeMapper from "../mappers/routeMapper.js";
import DeliveryMapper from "../mappers/DeliveryMapper.js";
import Client from "../models/client.js";
import { protectDelivery } from "../middlewares/validartoken.js";

const router = express.Router();

router.get("/delivery-history-list", protectDelivery, async (req, res) => {
  try {
    const { deliveryId } = req.query;

    const filter = { state: "delivered" };

    if (deliveryId) {
      filter.delivery = deliveryId;
    }

    const routes = await Route.find(filter).populate("client");
    const dtos = routes.map(routeMapper);

    res.json(dtos);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the delivery history.",
    });
  }
});

router.get(
  "/deliveries/history/:agentId/:deliveryId",
  protectDelivery,
  async (req, res) => {
    try {
      const { agentId, deliveryId } = req.params;

      const route = await Route.findOne({
        _id: deliveryId,
        delivery: agentId,
      }).populate(["client", "package"]);

      if (!route) {
        return res.status(404).json({ error: "Entrega no encontrada" });
      }

      const deliveryDetail = DeliveryMapper.toDetail(route);
      res.json(deliveryDetail);
    } catch (error) {
      console.error("Error al obtener detalles de entrega:", error);
      res.status(500).json({
        error: "Ocurrió un error al obtener los detalles de la entrega",
      });
    }
  }
);

export default router;
