/**
 * Utilidades para generar códigos de confirmación de entrega
 */

/**
 * Genera un código de confirmación de entrega aleatorio de 6 dígitos
 * @returns {string} Código de 6 dígitos
 */
export const generateDeliveryConfirmationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Genera código de entrega con mayor seguridad (alfanumérico)
 * @returns {string} Código alfanumérico de 6 caracteres
 */
export const generateSecureDeliveryCode = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
