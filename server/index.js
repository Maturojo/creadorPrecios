require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productosRouter = require("./routes/productos");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/productos", productosRouter);

const PORT = 4000;
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