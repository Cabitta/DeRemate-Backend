import routeDTO from '../dtos/routeDTO.js';

const routeMapper = (route) => {
    if (!route) return null;

    return new routeDTO({
        state: route.state,
        end_date_time: route.end_date_time,
        client_name: route.client?.firstname,
        client_lastname: route.client?.lastname,
        delivery_time: calculateDeliveryTime(route.init_date_time, route.end_date_time)
    });
};

function calculateDeliveryTime(initDate, endDate) {
    if (!initDate || !endDate) return null;
    const diffMs = new Date(endDate) - new Date(initDate);
    const diffHours = diffMs / (1000 * 60 * 60);
    return `${diffHours.toFixed(2)} hours`;
}

export default routeMapper;