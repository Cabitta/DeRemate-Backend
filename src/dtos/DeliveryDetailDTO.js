class DeliveryDetailDTO {
  constructor({
    orderId,
    clientName,
    clientLastname,
    address,
    status,
    qrCode,
    packageLocation,
    initDateTime,
    endDateTime,
    deliveryTime,
  }) {
    this.orderId = orderId;
    this.clientName = clientName;
    this.clientLastname = clientLastname;
    this.clientFullName = `${clientName} ${clientLastname}`;
    this.address = address;
    this.status = status;
    this.qrCode = qrCode;
    this.packageLocation = {
      sector: packageLocation?.sector || "",
      shelf: packageLocation?.estante || "",
      column: packageLocation?.columna_estante || "",
    };
    this.initDateTime = initDateTime;
    this.endDateTime = endDateTime;
    this.deliveryTime = deliveryTime;
  }
}

export default DeliveryDetailDTO;
