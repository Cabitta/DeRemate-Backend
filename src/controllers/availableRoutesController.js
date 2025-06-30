import Route from "../models/route.js";
import Client from "../models/client.js";
import Package from "../models/package.js";
import { availableRouteMapper } from "../mappers/routeMapper.js";

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
    res.status(500).json({error: "An error occurred while fetching available routes."});
  }
}

export const setRouteState = async (req, res) => {
  try {
    const { routeId } = req.query;
    const { newState } = req.body;

    // Validate input
    if (!routeId || !newState) {
      return res.status(400).json({ message: "Route ID and state are required" });
    }

    // Update the route state
    const updatedRoute = await Route.findByIdAndUpdate(
      routeId,
      { state: newState },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json(updatedRoute);
  } catch (error) {
    console.error("Error updating route state:", error);
    res.status(500).json({ error: "An error occurred while updating the route state." });
  }
}
