import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..", "..");

// Cargar variables de entorno desde diferentes ubicaciones posibles
const envPaths = [join(rootDir, ".env"), join(process.cwd(), ".env")];

let envFileLoaded = false;
for (const path of envPaths) {
  if (fs.existsSync(path)) {
    dotenv.config({ path });
    console.log(`Variables de entorno cargadas desde: ${path}`);
    envFileLoaded = true;
    break;
  }
}

if (!envFileLoaded) {
  console.warn("⚠️  No se encontró archivo .env");
  dotenv.config(); // Intenta cargar .env desde la ubicación predeterminada
}

// Verificar variables críticas
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET no está definido en las variables de entorno");
}

export const envConfig = {
  PORT: process.env.PORT || 3000,
  DB_URI: process.env.DB_URI || "mongodb://localhost:27017/deremate",
  JWT_SECRET: JWT_SECRET || "fallback_secret_key_only_for_development",
  JWT_EMAIL_VALIDATION:
    process.env.JWT_EMAIL_VALIDATION || "email_validation_key",
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
