class RouteDTO {
    constructor({ state, adress, init_date_time, end_date_time, client_name, client_lastname, delivery_time, client_email,  package_sector, package_estante, package_columna_estante }) {
        this.state = state;
        this.adress = adress;
        this.init_date_time = init_date_time;
        this.end_date_time = end_date_time;
        this.client_name = client_name;
        this.client_lastname = client_lastname;
        this.delivery_time = delivery_time;
        this.client_email = client_email;
        this.package_sector = package_sector;
        this.package_estante = package_estante;
        this.package_columna_estante = package_columna_estante;
    }
}

export default RouteDTO;
