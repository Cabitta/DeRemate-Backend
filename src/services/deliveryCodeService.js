import Route from "../models/route.js";
import { generateDeliveryConfirmationCode } from "../utils/deliveryCodeGenerator.js";
import { sendDeliveryConfirmationEmail } from "./emailService.js";

/**
 * Genera y asigna un código de confirmación de entrega a una ruta
 * Y asigna la ruta al delivery que la está tomando
 */
export const generateAndAssignDeliveryCode = async (routeId, deliveryId) => {
  try {
    const confirmationCode = generateDeliveryConfirmationCode();
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000);

    const updatedRoute = await Route.findByIdAndUpdate(
      routeId,
      {
        confirmationCode: confirmationCode,
        confirmationCodeExpiry: expiryTime,
        confirmationCodeUsed: false,
        delivery: deliveryId,
        state: "in_transit",
        init_date_time: new Date(),
      },
      { new: true }
    ).populate("client");

    if (!updatedRoute) {
      throw new Error("Ruta no encontrada");
    }

    console.log(
      `✅ Código de entrega generado para ruta ${routeId}: ${confirmationCode}`
    );
    console.log(`🚚 Ruta asignada al delivery: ${deliveryId}`);

    return {
      confirmationCode,
      route: updatedRoute,
    };
  } catch (error) {
    console.error("❌ Error generando código de entrega:", error.message);
    throw error;
  }
};

/**
 * Genera código de entrega y envía email al cliente
 */
export const generateAndSendDeliveryCode = async (routeId, deliveryId) => {
  try {
    const { confirmationCode, route } = await generateAndAssignDeliveryCode(
      routeId,
      deliveryId
    );

    if (!route || !route.client) {
      throw new Error("Ruta o cliente no encontrado");
    }

    const clientName =
      route.client.firstname && route.client.lastname
        ? `${route.client.firstname} ${route.client.lastname}`
        : route.client.firstname || "Cliente";

    await sendDeliveryConfirmationEmail(
      route.client.email,
      confirmationCode,
      clientName
    );

    console.log(
      `📧 Código de entrega enviado al cliente: ${route.client.email}`
    );

    return {
      confirmationCode,
      route,
      clientName,
      clientEmail: route.client.email,
    };
  } catch (error) {
    console.error("❌ Error enviando código de entrega:", error.message);
    throw error;
  }
};
