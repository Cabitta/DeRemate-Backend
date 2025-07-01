import routeDTO from "../dtos/routeDTO.js";

export const historyRouteMapper = (route) => {
  if (!route) return null;

  return new routeDTO({
    id: route._id,
    state: route.state,
    end_date_time: route.end_date_time,
    client_name: route.client?.firstname,
    client_lastname: route.client?.lastname,
    delivery_time: calculateDeliveryTime(
      route.init_date_time,
      route.end_date_time
    ),
  });
};

export const availableRouteMapper = (route) => {
  if (!route) return null;

  return new routeDTO({
    id: route._id,
    address: route.address,

    client_name: route.client?.firstname,
    client_lastname: route.client?.lastname,
    client_email: route.client?.email,

    package_sector: route.package?.sector,
    package_estante: route.package?.estante,
    package_columna_estante: route.package?.columna_estante,
  });
};

export const inTransitRouteMapper = (route) => {
  if (!route) return null;

  return new routeDTO({
    address: route.address,

    client_name: route.client?.firstname,
    client_lastname: route.client?.lastname,
    client_email: route.client?.email,
  });
};

function calculateDeliveryTime(initDate, endDate) {
  if (!initDate || !endDate) return null;
  const diffMs = new Date(endDate) - new Date(initDate);
  const diffHours = diffMs / (1000 * 60 * 60);
  return `${diffHours.toFixed(2)} hours`;
}
