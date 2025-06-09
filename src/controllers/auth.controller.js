import delivery from "../models/delivery.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { envConfig } from "../utils/envConfig.js";
import Delivery from "../models/delivery.js";
import enviarmailRecuperacion from "../libs/mailer.js";
import nodemailer from "nodemailer";
const codigosTemporales = new Map();

function validarContraseña(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~]).{12,}$/;
  return regex.test(password);
}

function buscarEmailPorCodigo(codigoBuscado) {
  for (const [email, datos] of codigosTemporales.entries()) {
    if (datos.codigo == codigoBuscado) {
      return { email, datos };
    }
  }
  return null;
}

export const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    // Validate request body
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    console.log("password:", password);
    if (!validarContraseña(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingAccount = await Delivery.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassowrd = await bcrypt.hash(password, salt);

    // Generar código de verificación de 5 dígitos
    const verificationCode = Math.floor(
      10000 + Math.random() * 90000
    ).toString();

    // Mostrar el código en la consola para pruebas
    console.log(`Código de verificación para ${email}: ${verificationCode}`);

    const verificationCodeExpires = new Date();
    verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 1);

    const newAccount = new Delivery({
      firstname,
      lastname,
      email,
      password: hashedPassowrd,
      verificationCode,
      verificationCodeExpires,
    });

    if (!newAccount) {
      return res.status(400).json({ message: "Failed to create account" });
    }

    await newAccount.save();

    const token = jwt.sign({ id: newAccount._id }, envConfig.JWT_SECRET, {
      expiresIn: "12h",
    });

    // Configurar el envío de email con el código
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: envConfig.EMAIL_USER,
        pass: envConfig.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: envConfig.EMAIL_USER,
      to: email,
      subject: "Código de verificación de DeRemate",
      text: `Tu código de verificación es: ${verificationCode}\n\nEste código expirará en 1 hora.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>¡Bienvenido a DeRemate!</h2>
          <p>Por favor utiliza el siguiente código para verificar tu cuenta:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${verificationCode}
          </div>
          <p>Este código expirará en 1 hora.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      console.log("Email sent:", info.response);
    });

    res.status(201).json({
      message:
        "Cuenta creada exitosamente. Por favor revisa tu correo para obtener el código de verificación.",
      token,
    });
  } catch (err) {
    console.log("Error in register controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message:
          "Se requiere el correo electrónico y el código de verificación",
      });
    }

    const user = await Delivery.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Código inválido o expirado",
      });
    }

    if (user.active) {
      return res.status(400).json({ message: "Cuenta ya verificada" });
    }

    // Actualizar usuario
    user.active = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.status(200).json({ message: "Cuenta verificada exitosamente" });
  } catch (error) {
    console.error("Error en verificación de cuenta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

function validarCorreo(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

// Agregar esta función para generar tokens de acceso y refresh
const generateTokens = (userId) => {
  // Generar token de acceso
  const accessToken = jwt.sign({ id: userId }, envConfig.JWT_SECRET, {
    expiresIn: envConfig.ACCESS_TOKEN_EXPIRES,
  });

  // Calcular fecha de expiración para el cliente
  const accessTokenExpiry = new Date();
  // Parsear el tiempo de expiración (por ejemplo, '1h' a milisegundos)
  const expiresInMs = parseExpirationTime(envConfig.ACCESS_TOKEN_EXPIRES);
  accessTokenExpiry.setTime(accessTokenExpiry.getTime() + expiresInMs);

  // Generar refresh token con expiración más larga
  const refreshToken = jwt.sign(
    { id: userId },
    envConfig.REFRESH_TOKEN_SECRET,
    { expiresIn: envConfig.REFRESH_TOKEN_EXPIRES }
  );

  // Calcular fecha de expiración del refresh token para guardarlo en DB
  const refreshTokenExpiry = new Date();
  const refreshExpiresInMs = parseExpirationTime(
    envConfig.REFRESH_TOKEN_EXPIRES
  );
  refreshTokenExpiry.setTime(refreshTokenExpiry.getTime() + refreshExpiresInMs);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry,
    refreshTokenExpiry,
  };
};

// Función para parsear el tiempo de expiración (1h, 7d, etc.) a milisegundos
const parseExpirationTime = (expirationString) => {
  const unit = expirationString.charAt(expirationString.length - 1);
  const value = parseInt(expirationString.slice(0, -1));

  switch (unit) {
    case "s":
      return value * 1000; // segundos
    case "m":
      return value * 60 * 1000; // minutos
    case "h":
      return value * 60 * 60 * 1000; // horas
    case "d":
      return value * 24 * 60 * 60 * 1000; // días
    default:
      return 3600 * 1000; // por defecto 1 hora
  }
};

// Modificar el login para usar la nueva función de generación de tokens
export const login = async (request, response) => {
  try {
    // Passport ya validó las credenciales y colocó el usuario en request.user
    const user = request.user;
    console.log("Entra aca")
    // Generar tokens y fechas de expiración
    const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } =
      generateTokens(user._id);

    // Guardar el refresh token en la base de datos
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshTokenExpiry;
    await user.save();

    // Formatear la respuesta para facilitar el uso con scripts de Postman
    const userData = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      active: user.active,
    };

    response.cookie("token", accessToken);
    response.cookie("refreshToken", refreshToken, { httpOnly: true });
    console.log("Entra al back")
    response.json({
      message: "Inicio de sesion exitoso",
      user: userData,
      token: accessToken,
      refreshToken: refreshToken,
      expirationDate: accessTokenExpiry,
      deliveryId: user._id,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Añadir nuevo endpoint para refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ mensaje: "Refresh token no proporcionado" });
    }

    // Verificar refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, envConfig.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ mensaje: "Refresh token inválido o expirado" });
    }

    // Buscar usuario con ese refresh token
    const user = await Delivery.findOne({
      _id: decoded.id,
      refreshToken: refreshToken,
      refreshTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(401)
        .json({ mensaje: "Token no válido para este usuario o expirado" });
    }

    // Generar nuevos tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiry,
      refreshTokenExpiry,
    } = generateTokens(user._id);

    // Actualizar refresh token en la base de datos
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpires = refreshTokenExpiry;
    await user.save();

    res.cookie("token", accessToken);
    res.cookie("refreshToken", newRefreshToken, { httpOnly: true });

    return res.json({
      token: accessToken,
      refreshToken: newRefreshToken,
      expirationDate: accessTokenExpiry,
      deliveryId: user._id,
    });
  } catch (error) {
    console.error("Error al refrescar token:", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

export const forgotpassword = async (request, response) => {
  try {
    const { email } = request.body;
    console.log(email);
    if (!validarCorreo(email)) {
      console.log("No toma al mail como valido");
      return response.status(400).json({
        mensaje:
          "El email ingresado no es valido. Pot favor ingrese uno valido",
      });
    }
    const usuarioEncontrado = await delivery.findOne({ email });
    if (!usuarioEncontrado) {
      console.log("No encuentra al usuario indicado en la base de datos");
      return response
        .status(400)
        .json({ mensaje: "No existe ninguna cuenta asociada a ese email" });
    }
    const token = jwt.sign(
      {
        id: usuarioEncontrado._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: "15m" }
    );
    console.log("Se debe enviar el correo");
    const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const expiracion = Date.now() + 15 * 60 * 1000; // 15 minutos
    codigosTemporales.delete(email);
    codigosTemporales.set(email, { codigo, expiracion });
    //await enviarmailRecuperacion(usuarioEncontrado.email, token)
    await enviarmailRecuperacion(usuarioEncontrado.email, codigo);
    response.cookie("token", token);
    return response
      .status(200)
      .json({ mensaje: "El mensaje se envio correctamente" });
  } catch (error) {
    console.log("Tira error predeterminado");
    console.error(error);
    response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

export const resetpassword = async (request, response) => {
  try {
    const { code, newpassword, confirmPassword } = request.body;
    const entrada = buscarEmailPorCodigo(code);
    console.log(
      JSON.stringify(Array.from(codigosTemporales.entries()), null, 2)
    );

    if (!entrada) {
      console.log("Lo toma como no valido");
      return response.status(400).json({ mensaje: "Codigo no valido" });
    }
    if (Date.now() > entrada.expiracion) {
      codigosTemporales.delete(entrada.email);
      console.log("Codigo vencido");
      return response
        .status(400)
        .json({ mensaje: "El código expiró, solicitá uno nuevo" });
    }
    if (!validarContraseña(newpassword)) {
      console.log("Considera que la contraseña es segura");
      return response.status(400).json({ mensaje: "Contraseña insegura" });
    }
    if (newpassword != confirmPassword) {
      console.log(newpassword);
      console.log(confirmPassword);
      console.log("Las contraseñas no coinciden");
      return response
        .status(400)
        .json({ mensaje: "Las contraseñas no coinciden" });
    }
    console.log("Otro problema");
    const usuarioEncontrado = await delivery.findOne({ email: entrada.email });
    const hashedPassword = await bcrypt.hash(newpassword, 10);
    usuarioEncontrado.password = hashedPassword;
    await usuarioEncontrado.save();
    return response
      .status(200)
      .json({ mensaje: "La contraseña fue modificada exitosamente" });
  } catch (error) {
    response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

export const recoverypassword = async (request, response) => {
  try {
    const { token, password, recoverypassword } = request.body;
    if (!token) {
      return res.status(400).json({ message: "Token invalido o expirado" });
    }
    if (!validarContraseña(password)) {
      return response.status(400).json({
        mensaje:
          "La contraseña debe tener 12 caracteres, entre ellas una mayuscula, minuscula, numero y caracter especial",
      });
    }
    if (password !== recoverypassword) {
      return response.status(400).json({
        mensaje: "Las contraseñas no coinciden. Por favor vuelva a ingresarlas",
      });
    }
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, envConfig.JWT_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Token invalido o token expirado" });
    }

    const usuarioEncontrado = await delivery.findById(decodedToken.id);
    if (!usuarioEncontrado) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    usuarioEncontrado.password = hashedPassword;
    await usuarioEncontrado.save();
    response
      .status(200)
      .json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error(error);
    response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Modificar el logout para invalidar también el refresh token
export const logout = async (request, response) => {
  try {
    // Si tenemos el usuario en el request gracias a algún middleware
    if (request.user) {
      const user = await Delivery.findById(request.user._id);
      if (user) {
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await user.save();
      }
    }

    response.cookie("token", "", {
      expires: new Date(0),
    });
    response.cookie("refreshToken", "", {
      expires: new Date(0),
    });

    return response
      .status(200)
      .json({ mensaje: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

export const profile = async (request, response) => {
  response.send("Profile");
};
