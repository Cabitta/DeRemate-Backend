import nodemailer from "nodemailer";
import { envConfig } from "../utils/envConfig.js";

/**
 * Configuración del transportador de email
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: envConfig.EMAIL_USER,
      pass: envConfig.EMAIL_PASSWORD,
    },
  });
};

/**
 * Plantilla HTML para el email de confirmación de entrega
 */
const getDeliveryConfirmationEmailTemplate = (
  confirmationCode,
  clientName = "Cliente"
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Código de Confirmación - DeRemate</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .code-box { background-color: #007bff; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 5px; letter-spacing: 5px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 DeRemate - Confirmación de Entrega</h1>
            </div>
            <div class="content">
                <h2>¡Hola ${clientName}!</h2>
                <p>Tu paquete está siendo entregado en este momento. Para confirmar la recepción de tu pedido, comparte el siguiente código con nuestro repartidor:</p>
                
                <div class="code-box">
                    ${confirmationCode}
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este código expira en <strong>30 minutos</strong></li>
                        <li>Solo compártelo con el repartidor oficial de DeRemate</li>
                        <li>Una vez usado, no podrá ser reutilizado</li>
                    </ul>
                </div>
                
                <p>Si no estás esperando una entrega o tienes alguna duda, contacta inmediatamente a nuestro servicio al cliente.</p>
                
                <p>¡Gracias por confiar en DeRemate!</p>
            </div>
            <div class="footer">
                <p>Este es un email automático, por favor no responder.</p>
                <p>© ${new Date().getFullYear()} DeRemate - Todos los derechos reservados</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Envía email de confirmación de entrega al cliente
 * @param {string} clientEmail - Email del cliente
 * @param {string} confirmationCode - Código de confirmación de 6 dígitos
 * @param {string} clientName - Nombre del cliente (opcional)
 * @returns {Promise<boolean>} True si se envió correctamente
 */
export const sendDeliveryConfirmationEmail = async (
  clientEmail,
  confirmationCode,
  clientName = "Cliente"
) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `"DeRemate Deliveries" <${envConfig.EMAIL_USER}>`,
      to: clientEmail,
      subject: `🚚 Código de Confirmación de Entrega: ${confirmationCode}`,
      html: getDeliveryConfirmationEmailTemplate(confirmationCode, clientName),
      text: `
        DeRemate - Confirmación de Entrega
        
        Hola ${clientName},
        
        Tu paquete está siendo entregado. Para confirmar la recepción, comparte este código con el repartidor:
        
        CÓDIGO: ${confirmationCode}
        
        ⚠️ Este código expira en 30 minutos y solo puede usarse una vez.
        
        Gracias por confiar en DeRemate.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email de confirmación enviado a ${clientEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error.message);
    throw new Error(`Error enviando email: ${error.message}`);
  }
};

/**
 * Verifica la configuración del servicio de email
 * @returns {Promise<boolean>} True si la configuración es válida
 */
export const verifyEmailService = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log("✅ Servicio de email configurado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error en configuración de email:", error.message);
    return false;
  }
};
