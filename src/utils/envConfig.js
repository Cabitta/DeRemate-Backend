import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EMAIL_VALIDATION: process.env.JWT_EMAIL_VALIDATION,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};
