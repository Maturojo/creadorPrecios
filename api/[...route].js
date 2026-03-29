import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const authRouter = require("../server/routes/auth");
const { requireGoogleAuth } = require("../server/auth/googleAuth");
const productosRouter = require("../server/routes/productos");

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const cached = globalThis.__mongooseCache || {
  conn: null,
  promise: null,
};

globalThis.__mongooseCache = cached;

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

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (corsOrigins.length === 0 || esOrigenPermitido(origin)) {
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

async function connectToDatabase() {
  if (!mongoUri) {
    throw new Error("Falta MONGODB_URI o MONGO_URI en las variables de entorno");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
      })
      .then((connection) => connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Error inicializando la API:", error);
    return res.status(500).json({
      error: "No se pudo inicializar la API",
    });
  }
}
