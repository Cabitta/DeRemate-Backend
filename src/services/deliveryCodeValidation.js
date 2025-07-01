import Route from '../models/route.js';

/**
 * Valida un código de confirmación de entrega
 */
export const validateDeliveryCode = async (routeId, inputCode) => {
  try {
    const route = await Route.findById(routeId);
    
    if (!route) {
      throw new Error('Ruta no encontrada');
    }
    
    if (!route.confirmationCode) {
      throw new Error('No hay código de confirmación de entrega para esta ruta');
    }
    
    if (route.confirmationCodeUsed) {
      throw new Error('Código de confirmación de entrega ya utilizado');
    }
    
    if (new Date() > route.confirmationCodeExpiry) {
      throw new Error('Código de confirmación de entrega expirado');
    }
    
    if (route.confirmationCode !== inputCode) {
      throw new Error('Código de confirmación de entrega incorrecto');
    }
    
    // Marcar como usado y completar entrega
    await Route.findByIdAndUpdate(routeId, {
      confirmationCodeUsed: true,
      state: 'delivered',
      end_date_time: new Date()
    });
    
    console.log(`✅ Código de entrega validado para ruta ${routeId}`);
    return true;
  } catch (error) {
    console.error('❌ Error validando código de entrega:', error.message);
    throw error;
  }
};

/**
 * Verifica si un código de entrega está disponible para usar
 */
export const isDeliveryCodeValid = async (routeId) => {
  try {
    const route = await Route.findById(routeId);
    
    if (!route || !route.confirmationCode) return false;
    if (route.confirmationCodeUsed) return false;
    if (new Date() > route.confirmationCodeExpiry) return false;
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando código de entrega:', error.message);
    return false;
  }
};