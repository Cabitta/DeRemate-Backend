class RouteDTO {
    constructor({ state, end_date_time, client_name, client_lastname, delivery_time}) {
        this.state = state;
        this.end_date_time = end_date_time;
        this.client_name = client_name;
        this.client_lastname = client_lastname;
        this.delivery_time = delivery_time;
    }
}

export default RouteDTO;
