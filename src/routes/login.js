import express from "express"
import morgan from "morgan"
const app = express()
const puerto = 3000
let Usuarios = [{ID: 1, Nombre: "Rodrigo", Apellido: "Moens", Email: "rodrigo_moens@hotmail.com", Contraseña: "Verano2023!!"},
    {ID: 2, Nombre: "Rodrigo", Apellido: "Gomez", Email: "rodrigo_gomez@hotmail.com", Contraseña: "Futbol@2024"},
    {ID: 3, Nombre: "Felipe", Apellido: "Moens", Email: "felipe_moens@hotmail.com", Contraseña: "P@labra123!"},
    {ID: 4, Nombre: "Sonia", Apellido: "Rocabado", Email: "sonia_rocabado@hotmail.com", Contraseña: "HolaMundo!2023"},
    {ID: 5, Nombre: "Lionel", Apellido: "Messi", Email: "lionel_messi@hotmail.com", Contraseña: "C0d1g0@fAc1l"},
    {ID: 6, Nombre: "Max", Apellido: "Verstappen", Email: "max_verstappen@hotmail.com", Contraseña: "Segur1dad!2025"}
]

app.use(express.json())

function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function validarContraseña(password) {
    // La contraseña debe tener al menos 12 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~]).{12,}$/;
    return regex.test(password);
  }
  

app.post('/login', (request, response)=>{
    const {Email, password} = request.body
    if (!validarCorreo(Email)){
        console.log("El correo no tiene un formato valido")
        return response.status(400).send("El correo tiene formato invalido")
    }
    if (!validarContraseña(Contraseña)){
        console.log("La contraseña no es valida")
        return response.status(400).send("La contraseña no es valida")
    }
    const usuarioEncontrado = Usuarios.find(function(Usuario){
        return ((Usuario.Email === Email) && (Usuario.Contraseña === Contraseña))
    })
    if (usuarioEncontrado){
        console.log("Hola " + usuarioEncontrado.Nombre + " " + usuarioEncontrado.Apellido)
        return response.status(200).send("Iniciaste sesion")
    }
    else{
        console.log("El usuario y/o contraseñas son incorrectos")
        return response.status(401).send("El usuario y/o contraseñas son incorrectos")
    }
})

app.listen(puerto)
console.log("Funciona")