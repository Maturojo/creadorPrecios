require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRouter = require("./routes/auth");
const { requireGoogleAuth } = require("./auth/googleAuth");
const productosRouter = require("./routes/productos");

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function esOrigenPermitido(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (esOrigenPermitido(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/productos", requireGoogleAuth, productosRouter);

const PORT = Number(process.env.PORT) || 4000;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("Falta MONGODB_URI o MONGO_URI en .env");
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ Mongo conectado");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error conectando Mongo:", error);
  });
