import Route from "../models/route.js";
import Client from "../models/client.js";
import Package from "../models/package.js";
import {
  availableRouteMapper,
  inTransitRouteMapper,
} from "../mappers/routeMapper.js";
import { createNotification } from "./notificationController.js";
import { generateAndSendDeliveryCode } from "../services/deliveryCodeService.js";

export const getAllAvailableRoutes = async (req, res) => {
  try {
    // Fetch available routes for the given deliveryId
    const routes = await Route.find({ state: "pending" })
      .populate("package")
      .populate("client");

    // Map the routes to DTOs
    const dtos = routes.map(availableRouteMapper);

    res.status(200).json(dtos);
  } catch (error) {
    console.error("Error fetching available routes:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching available routes." });
  }
};

export const getInTransitRouteByDeliveryId = async (req, res) => {
  try {
    const { deliveryId } = req.query;

    // Validate input
    if (!deliveryId) {
      return res.status(400).json({ message: "Delivery ID is required" });
    }

    // Fetch routes in transit for the given deliveryId
    const inTransitRoute = await Route.findOne({
      delivery: deliveryId,
      state: "in_transit",
    })
      .populate("package")
      .populate("client");

    // Map the routes to DTOs
    const dto = inTransitRouteMapper(inTransitRoute);

    res.status(200).json(dto);
  } catch (error) {
    console.error;
  }
};

export const setRouteState = async (req, res) => {
  try {
    const { routeId } = req.query;
    const { state, delivery } = req.body;

    // Validate input
    if (!routeId || !state || !delivery) {
      return res
        .status(400)
        .json({ message: "Route ID, state or delivery are required" });
    }

    let updatedRoute;

    if (state === "in_transit") {
      try {
        const result = await generateAndSendDeliveryCode(routeId, delivery);
        updatedRoute = result.route;
        console.log(
          `✅ Código generado automáticamente para ruta ${routeId}: ${result.confirmationCode}`
        );
      } catch (codeError) {
        console.error(
          "❌ Error generando código automáticamente:",
          codeError.message
        );
        return res.status(500).json({
          error: "Error generando código de entrega",
        });
      }
    } else {
      updatedRoute = await Route.findByIdAndUpdate(
        routeId,
        { state: state, delivery: delivery },
        { new: true }
      );
    }

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    if (state === "in_transit") {
      console.log("Setroute:", delivery);
      await createNotification(
        delivery,
        "Ruta iniciada",
        `Has comenzado la entrega hacia ${updatedRoute.address}.`
      );
    } else if (state === "delivered") {
      await createNotification(
        delivery,
        "Entrega completada",
        `Has completado la entrega en ${updatedRoute.address}.`
      );
    } else if (state === "cancelled") {
      await createNotification(
        delivery,
        "Ruta cancelada",
        `La entrega hacia ${updatedRoute.address} ha sido cancelada.`
      );
    } else if (state === "pending") {
      await createNotification(
        delivery,
        "Ruta pendiente",
        `La entrega hacia ${updatedRoute.address} está pendiente.`
      );
    }

    res.status(200).json(updatedRoute);
  } catch (error) {
    console.error("Error updating route state:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the route state." });
  }
};
