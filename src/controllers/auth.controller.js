import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { envConfig } from "../utils/envConfig.js";
import { Client } from "../models/client.model.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate request body
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingClientAccount = await Client.findOne({ email });
    if (existingClientAccount) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassowrd = await bcrypt.hash(password, salt);

    const newAccount = new Client({
      firstName,
      lastName,
      email,
      password: hashedPassowrd,
    });

    if (!newAccount) {
      return res.status(400).json({ message: "Failed to create account" });
    }

    await newAccount.save();

    // Generate JWT token
    const token = jwt.sign({ id: newAccount._id }, envConfig.JWT_SECRET, {
      expiresIn: "12h",
    });

    // Send response
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
