import DeliveryDetailDTO from "../dtos/DeliveryDetailDTO.js";

class DeliveryMapper {
  static toDetail(route) {
    if (!route) return null;

    return new DeliveryDetailDTO({
      orderId: route._id,
      clientName: route.client?.firstname,
      clientLastname: route.client?.lastname,
      address: route.address,
      status: route.state,
      qrCode: route.package?.qr,
      packageLocation: {
        sector: route.package?.sector,
        estante: route.package?.estante,
        columna_estante: route.package?.columna_estante,
      },
      initDateTime: route.init_date_time,
      endDateTime: route.end_date_time,
      deliveryTime: this.calculateDeliveryTime(
        route.init_date_time,
        route.end_date_time
      ),
    });
  }

  static calculateDeliveryTime(initDate, endDate) {
    if (!initDate || !endDate) return null;
    const diffMs = new Date(endDate) - new Date(initDate);
    const diffHours = diffMs / (1000 * 60 * 60);
    return `${diffHours.toFixed(2)} hours`;
  }
}

export default DeliveryMapper;
