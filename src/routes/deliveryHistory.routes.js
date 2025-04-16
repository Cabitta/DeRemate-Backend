import express from "express";
import Route from "../models/route.js";
import routeMapper from "../mappers/routeMapper.js";
import Client from "../models/client.js";

const router = express.Router();

router.get("/delivery-history-list", async (req, res) => {
    try {
        const { deliveryId } = req.query;

        const filter = { state: 'delivered' };

        if (deliveryId) {
            filter.delivery = deliveryId;
        }

        const routes = await Route.find(filter).populate("client");
        const dtos = routes.map(routeMapper);

        res.json(dtos);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching the delivery history." });
    }
});

export default router;