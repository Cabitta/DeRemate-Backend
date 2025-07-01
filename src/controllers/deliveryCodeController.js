import {
  generateAndSendDeliveryCode,
  generateAndAssignDeliveryCode,
} from "../services/deliveryCodeService.js";
import { validateDeliveryCode } from "../services/deliveryCodeValidation.js";
import Route from "../models/route.js";

/**
 * Genera y envía código de confirmación al cliente
 * POST /delivery-codes/generate
 */
export const generateCode = async (req, res) => {
  try {
    const { routeId } = req.body;
    const deliveryId = req.delivery.id || req.delivery._id;

    if (!routeId) {
      return res.status(400).json({
        error: "Route ID es requerido",
      });
    }

    // Verificar que la ruta esté disponible (pending)
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        error: "Ruta no encontrada",
      });
    }

    if (route.state !== "pending") {
      return res.status(400).json({
        error: `La ruta no está disponible. Estado actual: ${route.state}`,
      });
    }

    if (route.delivery && route.delivery.toString() !== deliveryId) {
      return res.status(409).json({
        error: "La ruta ya está asignada a otro delivery",
      });
    }

    const result = await generateAndSendDeliveryCode(routeId, deliveryId);

    res.status(200).json({
      message: "Código generado y enviado exitosamente",
      routeId,
      deliveryId,
      codeGenerated: true,
      routeState: "in_transit",
      clientInfo: {
        name: result.clientName,
        email: result.clientEmail,
      },
    });
  } catch (error) {
    console.error("❌ Error generando código:", error.message);
    res.status(500).json({
      error: error.message || "Error generando código de entrega",
    });
  }
};

/**
 * Valida código de confirmación ingresado por delivery
 * POST /delivery-codes/validate
 */
export const validateCode = async (req, res) => {
  try {
    const { routeId, confirmationCode } = req.body;
    const deliveryId = req.delivery.id || req.delivery._id;

    if (!routeId || !confirmationCode) {
      return res.status(400).json({
        error: "Route ID y código de confirmación son requeridos",
      });
    }

    // Validar que el código tenga 6 dígitos
    if (!/^\d{6}$/.test(confirmationCode)) {
      return res.status(400).json({
        error: "El código debe tener exactamente 6 dígitos",
      });
    }

    // Verificar que la ruta pertenezca al delivery logueado
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        error: "Ruta no encontrada",
      });
    }

    if (route.delivery.toString() !== deliveryId.toString()) {
      return res.status(403).json({
        error: "No tienes permisos para validar esta ruta",
      });
    }

    const isValid = await validateDeliveryCode(routeId, confirmationCode);

    if (isValid) {
      res.status(200).json({
        message: "Código validado exitosamente",
        routeId,
        deliveryId,
        delivered: true,
        deliveredAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Error validando código:", error.message);

    // Mapear errores específicos
    let statusCode = 400;
    let errorMessage = error.message;

    if (error.message.includes("no encontrada")) {
      statusCode = 404;
    } else if (
      error.message.includes("expirado") ||
      error.message.includes("utilizado")
    ) {
      statusCode = 410; // Gone - recurso ya no disponible
    }

    res.status(statusCode).json({
      error: errorMessage,
    });
  }
};

/**
 * Obtiene el estado del código de una ruta
 * GET /delivery-codes/status/:routeId
 */
export const getCodeStatus = async (req, res) => {
  try {
    const { routeId } = req.params;
    const deliveryId = req.delivery.id || req.delivery._id;

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({
        error: "Ruta no encontrada",
      });
    }

    // Verificar que la ruta pertenezca al delivery logueado
    if (route.delivery && route.delivery.toString() !== deliveryId.toString()) {
      return res.status(403).json({
        error: "No tienes permisos para ver esta ruta",
      });
    }

    const hasCode = !!route.confirmationCode;
    const isExpired = route.confirmationCodeExpiry
      ? new Date() > route.confirmationCodeExpiry
      : false;
    const isUsed = route.confirmationCodeUsed;

    res.status(200).json({
      routeId,
      deliveryId,
      hasConfirmationCode: hasCode,
      isExpired,
      isUsed,
      canUseCode: hasCode && !isExpired && !isUsed,
      expiresAt: route.confirmationCodeExpiry,
      routeState: route.state,
      assignedDelivery: route.delivery,
    });
  } catch (error) {
    console.error("❌ Error obteniendo estado del código:", error.message);
    res.status(500).json({
      error: "Error obteniendo estado del código",
    });
  }
};
