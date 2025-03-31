# DeRemate-Backend

Tenemos que tener una rama por cada funcionalidad, que se llamaran de la siguiente manera:
- feature/authentication
- feature/register
- feature/route-managment
- feature/home-screen
- feature/delivery
- feature/delivery-history
- feature/push-notifications

o de la siguiente manera:
- feature/authentication-register
- feature/routeManagment-homeScreen
- feature/delivery
- feature/deliveryHistory
- feature/pushNotifications

Cada uno se encargara de UNO de los CINCO puntos mencionados en el TPO:

1. Autenticación y Registro de Usuarios: 
➔ Implementar un sistema de registro que incluya validación de correo electrónico 
mediante el envío de un código de confirmación. 
➔ Sistema de inicio de sesión seguro con opciones de recuperación de contraseña. 

2. Gestión de Rutas - Home Screen:  
➔ Mostrar una lista de rutas disponibles para el repartidor.  
➔ Las rutas se desbloquean escaneando un código QR asociado con el paquete a 
entregar. Es importante dar información del paquete para que el repartidor pueda 
ubicarlo en el depósito (ubicación, etc). 
➔ Registro de cada ruta asignada al usuario y su estado (pendiente, en curso, 
completada). 

3. Proceso de Entrega: 
➔ Una vez escaneado el código QR, el repartidor recibe los detalles de la ruta y 
comienza el proceso de entrega.  
➔ Cuando dicha ruta comienza, el repartidor va a poder navegar hacia la ruta destino 
teniendo una integración con google maps. A partir de la dirección otorgada, se 
abrirá dicha aplicación externa para ayudar a trazar la ruta. 
➔ El repartidor marcará una entrega como completa mediante la introducción de un 
código de confirmación proporcionado por el comprador. 

4. Historial de Entregas: 
➔ Proporcionar una sección donde los repartidores puedan ver un historial de sus 
entregas completadas, con detalles como tiempo de entrega, cliente, y estado final. 

5. Notificaciones Push: 
➔ Integrar notificaciones push para alertar a los repartidores sobre nuevas rutas 
disponibles o cambios en las entregas pendientes.
