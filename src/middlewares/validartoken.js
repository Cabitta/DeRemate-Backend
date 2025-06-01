import jwt from "jsonwebtoken";
import { envConfig } from "../utils/envConfig.js";
import Delivery from "../models/delivery.js";
import passport from "passport";

export const authRequired = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ mensaje: info?.message || "No autorizado" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const verifyToken = (token) => {
  return jwt.verify(token, envConfig.JWT_SECRET);
};

export const protectDelivery = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log("Error en middleware protectDelivery", err.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info?.message || "No autorizado - Token no válido" });
    }

    req.user = user;

    next();
  })(req, res, next);
};
