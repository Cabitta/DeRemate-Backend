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

    // Map the routes to DTOs
    const dtos = routes.map(availableRouteMapper);

    res.status(200).json(dtos);
  } catch (error) {
    console.error("Error fetching available routes:", error);
    res.status(500).json({error: "An error occurred while fetching available routes."});
  }
}

// export const setRouteState = async (req, res) => {
//   try {
//     const { routeId, state } = req.body;

//     // Validate input
//     if (!routeId || !state) {
//       return res.status(400).json({ message: "Route ID and state are required" });
//     }

//     // Update the route state
//     const updatedRoute = await Route.findByIdAndUpdate(
//       routeId,
//       { state },
//       { new: true }
//     );

//     if (!updatedRoute) {
//       return res.status(404).json({ message: "Route not found" });
//     }

//     res.status(200).json({ message: "Route state updated successfully", route: updatedRoute });
//   } catch (error) {
//     console.error("Error updating route state:", error);
//     res.status(500).json({ error: "An error occurred while updating the route state." });
//   }
// }
