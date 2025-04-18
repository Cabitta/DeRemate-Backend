import delivery from '../models/delivery.js'
import bcrypt from 'bcryptjs'
import { request } from 'express'
import jwt from 'jsonwebtoken'

export const register = async (request, response)=>{
    console.log("Aca se realiza el registro")
}


function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function validarContraseña(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~]).{12,}$/;
    return regex.test(password);
}

export const login = async (request, response) =>{
    try{
        const {email, password} = request.body
    // Validaciones antes de consultar la base de datos
    if (!validarCorreo(email)) {
        return response.status(400).json({ mensaje: "Correo inválido" })
    }
    if (!validarContraseña(password)) {
        return response.status(400).json({ mensaje: "La contraseña debe tener 12 caracteres, entre ellas una mayuscula, minuscula, numero y caracter especial"})
    }
    const deliverySaved = await delivery.findOne({email})
    if (!deliverySaved){
        return response.status(400).json({mensaje: "Usuario no encontrado"})
    }
    const contraseñaPerfecta = await bcrypt.compare(password, deliverySaved.password)
    if (!contraseñaPerfecta){
        return response.status(400).json({mensaje: "Las contraseñas no coinciden"})
    }
    const token = jwt.sign({
        id:deliverySaved._id}, 
        'secret123', 
        {expiresIn: '1d'})
    response.cookie('token', token)
    response.json({
        message: "Inicio de sesion exitoso",
        user: deliverySaved,
        token
    })
    }
    catch(error){
        console.error(error)
        response.status(500).json({mensaje: "Error en el servidor"})
    }
}

export const logout = async (request, response)=>{
    response.cookie('Token', "", {
        expires: new Date(0)
    })
    return response.sendStatus(200)
}

export const profile = async (request, response) =>{
    response.send("Profile")
}