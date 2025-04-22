import express from "express";
import Route from "../models/route.js";
import { historyRouteMapper } from "../mappers/routeMapper.js";
import DeliveryMapper from "../mappers/DeliveryMapper.js";
import { protectDelivery } from "../middlewares/validartoken.js";
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

router.get("/delivery-details/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;

    console.log(`Buscando ruta con ID: ${routeId}`);

    let route = await Route.findById(routeId).populate(["client", "package"]);

    if (!route) {
      console.log("No se encontró con findById, intentando con find...");
      const routes = await Route.find({}).populate(["client", "package"]);
      route = routes.find(
        (r) => r._id.toString() === routeId || r._id === routeId
      );
    }

    if (!route) {
      return res.status(404).json({
        error: "Ruta no encontrada",
        routeId: routeId,
      });
    }

    console.log("Ruta encontrada:", route);
    const deliveryDetail = DeliveryMapper.toDetail(route);
    res.json(deliveryDetail);
  } catch (error) {
    console.error("Error al obtener detalles de entrega:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Formato de ID incorrecto",
        message: error.message,
        routeId: req.params.routeId,
      });
    }
    res.status(500).json({
      error: "Ocurrió un error al obtener los detalles de la entrega",
      message: error.message,
    });
  }
});

export default router;
