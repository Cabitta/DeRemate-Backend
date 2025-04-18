import jwt from 'jsonwebtoken'

export const authRequired = (request, response, next)=>{
    const {token} = request.cookies
    if (!token){
        return response.status(401).json({mensaje: "No hay token. Autorizacion denegada"})
    }
    try{
        const tokenValido = jwt.verify(token, 'secret123')
        next()
    }
    catch (error){
        return response.status(401).json({mensaje: "Token invalido o expirado"})
    }
}