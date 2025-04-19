import jwt from "jsonwebtoken";
import { envConfig } from "../utils/envConfig.js";
import Delivery from "../models/delivery.js";

export const authRequired = (request, response, next) => {
  const { token } = request.cookies;
  if (!token) {
    return response
      .status(401)
      .json({ mensaje: "No hay token. Autorizacion denegada" });
  }
  try {
    const tokenValido = jwt.verify(token, "secret123");
    next();
  } catch (error) {
    return response.status(401).json({ mensaje: "Token invalido o expirado" });
  }
};

const verifyToken = (token) => {
  return jwt.verify(token, envConfig.JWT_SECRET);
};

export const protectDelivery = async (req, res, next) => {
  try {
    const token = req.body.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "No autorizado - Token no proporcionado" });
    }

    const decoded = verifyToken(token);

    const user = await Delivery.findById(decoded.id)
      .select("-password -resetPasswordToken")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error en middleware protectRouteUser", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
