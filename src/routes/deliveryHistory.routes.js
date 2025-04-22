import express from "express";
import Route from "../models/route.js";
import { historyRouteMapper } from "../mappers/routeMapper.js";
import DeliveryMapper from "../mappers/DeliveryMapper.js";
import Client from "../models/client.js";
import { protectDelivery } from "../middlewares/validartoken.js";
import mongoose from "mongoose";
import { responseTimeMiddleware } from "../middlewares/responseTimeMiddleware.js";

const router = express.Router();
router.use(responseTimeMiddleware);

router.get("/delivery-history-list", async (req, res) => {
  try {
    const { deliveryId } = req.query;

    const filter = { state: "delivered" };

    if (deliveryId) {
      filter.delivery = deliveryId;
    }

    const routes = await Route.find(filter).populate("client");
    const dtos = routes.map(historyRouteMapper);

    res.json(dtos);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the delivery history.",
    });
  }
});

router.get(
  "/deliveries/history/:agentId/:deliveryId",
  //protectDelivery,
  async (req, res) => {
    try {
      const { agentId, deliveryId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
        return res.status(400).json({ error: "ID de entrega inválido" });
      }

      console.log(
        `Solicitud de detalles - Agente: ${agentId}, Entrega: ${deliveryId}, Fecha: ${new Date().toISOString()}`
      );

      const route = await Route.findOne({
        delivery: deliveryId,
        client: agentId,
      }).populate(["client", "package"]);

      if (!route) {
        return res.status(404).json({ error: "Entrega no encontrada" });
      }

      const deliveryDetail = DeliveryMapper.toDetail(route);

      const responseTime = new Date() - req.startTime;
      console.log(`Tiempo de respuesta: ${responseTime}ms`);

      res.json(deliveryDetail);
    } catch (error) {
      console.error("Error al obtener detalles de entrega:", error);
      if (error.name === "CastError") {
        return res.status(400).json({ error: "Formato de ID incorrecto" });
      } else if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ error: "Error de validación", details: error.message });
      }
      res.status(500).json({
        error: "Ocurrió un error al obtener los detalles de la entrega",
        message: error.message,
      });
    }
  }
);
export default router;
