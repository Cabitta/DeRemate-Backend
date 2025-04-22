import Route from "../models/route.js";
import Client from "../models/client.js";
import Package from "../models/package.js";
import { availableRouteMapper } from "../mappers/routeMapper.js";

export const getAvailableRoutesByDeliveryId = async (req, res) => {
  try {
    const { deliveryId } = req.query;
    
    // Validate deliveryId
    if (!deliveryId) {
      return res.status(400).json({ message: "Delivery ID is required" });
    }
    
    // Fetch available routes for the given deliveryId
    const routes = await Route.find({ delivery: deliveryId, state: "pending" })
      .populate("package")  
      .populate("client");

    // Check if routes exist
    if (!routes || routes.length === 0) {
      return res.status(404).json({ message: "No available routes found" });
    }

    // Map the routes to DTOs
    const dtos = routes.map(availableRouteMapper);

    res.json(dtos);
  } catch (error) {
    console.error("Error fetching available routes:", error);
    res.status(500).json({
      error: "An error occurred while fetching available routes.",
    });
    
  }
}