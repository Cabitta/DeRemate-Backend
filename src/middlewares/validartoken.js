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
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(" ")[1];

      // Verificar token
      const decoded = jwt.verify(token, envConfig.JWT_SECRET);

      // Obtener delivery de la base de datos
      const delivery = await Delivery.findById(decoded.id);

      if (!delivery) {
        return res.status(401).json({
          error: "Token no válido - Delivery no encontrado",
        });
      }

      // Agregar delivery al request
      req.delivery = delivery;
      next();
    } catch (error) {
      console.error("❌ Error en autenticación:", error.message);
      return res.status(401).json({
        error: "Token no válido",
      });
    }
  } else {
    return res.status(401).json({
      error: "No se proporcionó token de autorización",
    });
  }
};
