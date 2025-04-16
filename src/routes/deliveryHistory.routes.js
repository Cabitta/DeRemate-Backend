import express from "express";
import routeMapper from "../mappers/routeMapper.js";
import { Client } from "../models/client.model.js";
import { Route } from "../models/route.model.js";

const router = express.Router();

router.get("/delivery-history-list", async (req, res) => {
  try {
    const routes = await Route.find({ state: "delivered" }).populate("client");
    const dtos = routes.map(routeMapper);

    res.json(dtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
