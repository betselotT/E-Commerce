const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const authRoutes = require("./routes/authRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://e-commerce-zeta-five-45.vercel.app/",
];

app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "To-Do API",
      version: "1.0.0",
    },
    servers: [
      { url: "http://localhost:5000" },
      { url: "https://e-commerce-rwlo.onrender.com" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api", flashcardRoutes);
app.use("/api", cartRoutes);

module.exports = app;
