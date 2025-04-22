import delivery from "../models/delivery.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { envConfig } from "../utils/envConfig.js";
import Delivery from "../models/delivery.js";
import nodemailer from "nodemailer";

function validarContraseña(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~]).{12,}$/;
  return regex.test(password);
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

export const login = async (request, response) => {
  try {
    const { email, password } = request.body;
    // Validaciones antes de consultar la base de datos
    if (!validarCorreo(email)) {
      return response.status(400).json({ mensaje: "Correo inválido" });
    }
    if (!validarContraseña(password)) {
      return response.status(400).json({
        mensaje:
          "La contraseña debe tener 12 caracteres, entre ellas una mayuscula, minuscula, numero y caracter especial",
      });
    }
    const deliverySaved = await delivery.findOne({ email });
    if (!deliverySaved) {
      return response.status(400).json({ mensaje: "Usuario no encontrado" });
    }

    if (!deliverySaved.active) {
      return response.status(400).json({
        mensaje:
          "Usuario no verificado, por favor verifica tu cuenta. Revisa tu correo electrónico",
      });
    }

    const contraseñaPerfecta = await bcrypt.compare(
      password,
      deliverySaved.password
    );
    if (!contraseñaPerfecta) {
      return response
        .status(400)
        .json({ mensaje: "Las contraseñas no coinciden" });
    }
    const token = jwt.sign(
      {
        id: deliverySaved._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: "1d" }
    );
    response.cookie("token", token);
    response.json({
      message: "Inicio de sesion exitoso",
      user: deliverySaved,
      token,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

export const logout = async (request, response) => {
  response.cookie("Token", "", {
    expires: new Date(0),
  });
  return response.sendStatus(200);
};

export const profile = async (request, response) => {
  response.send("Profile");
};
