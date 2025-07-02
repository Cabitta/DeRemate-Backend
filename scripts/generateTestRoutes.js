import mongoose from "mongoose";
import Route from "../src/models/route.js";
import Client from "../src/models/client.js";
import Package from "../src/models/package.js";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

const generateTestRoutes = async (numberOfRoutes = 10) => {
  try {
    console.log(`🚀 Generando ${numberOfRoutes} rutas de prueba...`);

    // Obtener clientes y paquetes existentes
    const clients = await Client.find();
    const packages = await Package.find();

    if (clients.length === 0 || packages.length === 0) {
      console.log(
        "⚠️ Necesitas al menos un cliente y un paquete en la base de datos"
      );
      return;
    }

    const addresses = [
      "Calle Test 100, CABA",
      "Av. Corrientes 1500, CABA",
      "Calle Florida 800, CABA",
      "Av. Santa Fe 2000, CABA",
      "Calle Lavalle 600, CABA",
      "Av. Rivadavia 3000, CABA",
      "Calle Defensa 400, CABA",
      "Av. 9 de Julio 1200, CABA",
      "Calle Maipú 900, CABA",
      "Av. Las Heras 1800, CABA",
      "Calle Reconquista 500, CABA",
      "Av. Callao 1100, CABA",
      "Calle Suipacha 700, CABA",
      "Av. Pueyrredón 1600, CABA",
      "Calle Uruguay 300, CABA",
    ];

    const routes = [];

    for (let i = 0; i < numberOfRoutes; i++) {
      // Seleccionar cliente y paquete aleatorio
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomPackage =
        packages[Math.floor(Math.random() * packages.length)];
      const randomAddress =
        addresses[Math.floor(Math.random() * addresses.length)];

      const route = {
        state: "pending",
        address: randomAddress,
        init_date_time: new Date(),
        delivery: null,
        client: randomClient._id,
        package: randomPackage._id,
        confirmationCode: null,
        confirmationCodeExpiry: null,
        confirmationCodeUsed: false,
      };

      routes.push(route);
    }

    // Insertar todas las rutas
    const createdRoutes = await Route.insertMany(routes);

    console.log(`✅ ${createdRoutes.length} rutas creadas exitosamente`);
    console.log("📋 Primeras 3 rutas creadas:");

    createdRoutes.slice(0, 3).forEach((route, index) => {
      console.log(`   ${index + 1}. ID: ${route._id} - ${route.address}`);
    });

    return createdRoutes;
  } catch (error) {
    console.error("❌ Error generando rutas:", error);
  }
};

const createSampleClientsAndPackages = async () => {
  try {
    console.log("🔍 Verificando clientes y paquetes existentes...");

    const clientCount = await Client.countDocuments();
    const packageCount = await Package.countDocuments();

    // Crear clientes de ejemplo si no existen
    if (clientCount === 0) {
      console.log("📝 Creando clientes de ejemplo...");
      const sampleClients = [
        { firstname: "Juan", lastname: "Pérez", email: "juan.perez@email.com" },
        {
          firstname: "María",
          lastname: "González",
          email: "maria.gonzalez@email.com",
        },
        {
          firstname: "Carlos",
          lastname: "López",
          email: "carlos.lopez@email.com",
        },
        { firstname: "Ana", lastname: "Martín", email: "ana.martin@email.com" },
        {
          firstname: "Luis",
          lastname: "Rodríguez",
          email: "luis.rodriguez@email.com",
        },
      ];
      await Client.insertMany(sampleClients);
      console.log("✅ 5 clientes de ejemplo creados");
    }

    // Crear paquetes de ejemplo si no existen
    if (packageCount === 0) {
      console.log("📦 Creando paquetes de ejemplo...");
      const samplePackages = [
        { qr: "QR001", sector: "A", estante: 1, columna_estante: 1 },
        { qr: "QR002", sector: "A", estante: 1, columna_estante: 2 },
        { qr: "QR003", sector: "B", estante: 2, columna_estante: 1 },
        { qr: "QR004", sector: "B", estante: 2, columna_estante: 2 },
        { qr: "QR005", sector: "C", estante: 3, columna_estante: 1 },
      ];
      await Package.insertMany(samplePackages);
      console.log("✅ 5 paquetes de ejemplo creados");
    }
  } catch (error) {
    console.error("❌ Error creando datos de ejemplo:", error);
  }
};

const main = async () => {
  await connectDB();

  // Crear clientes y paquetes si no existen
  await createSampleClientsAndPackages();

  // Generar rutas (puedes cambiar el número)
  const numberOfRoutes = process.argv[2] ? parseInt(process.argv[2]) : 10;
  await generateTestRoutes(numberOfRoutes);

  await mongoose.connection.close();
  console.log("🔌 Conexión cerrada");
};

// Ejecutar el script
main().catch(console.error);
