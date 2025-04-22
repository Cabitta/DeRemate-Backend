import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API DeRemate",
      version: "1.0.0",
      description: "Documentación de la API de DeRemate",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
  },
  apis: ["./src/docs/swagger/*.yaml", "./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
