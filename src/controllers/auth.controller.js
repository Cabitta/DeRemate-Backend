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

    const newAccount = new Delivery({
      firstname,
      lastname,
      email,
      password: hashedPassowrd,
    });

    if (!newAccount) {
      return res.status(400).json({ message: "Failed to create account" });
    }

    await newAccount.save();

    const token = jwt.sign({ id: newAccount._id }, envConfig.JWT_SECRET, {
      expiresIn: "12h",
    });

    const verificationToken = jwt.sign(
      { id: newAccount._id },
      envConfig.JWT_EMAIL_VALIDATION,
      { expiresIn: "1h" }
    );

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
      subject: "Verify your account",
      text: `Please verify your account by clicking the link: http://localhost:3000/verify/${verificationToken}`,
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
        "Account created successfully. Please check your email for verification.",
      token,
    });
  } catch (err) {
    console.log("Error in register controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Token de verificación no proporcionado" });
    }

    const decoded = jwt.verify(token, envConfig.JWT_EMAIL_VALIDATION);
    const user = await Delivery.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.active) {
      return res.status(400).json({ message: "Cuenta ya verificada" });
    }

    user.active = true;
    await user.save();

    res.status(200).json({ message: "Cuenta verificada exitosamente" });
  } catch (error) {
    console.error("Error en verificación de cuenta:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Token inválido" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "El token ha expirado. Por favor solicite uno nuevo.",
      });
    }

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
