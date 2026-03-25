const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Producto = require("./models/Producto");
const reglasPrefijoRoutes = require("./routes/reglasPrefijo");
const clasificarProducto = require("./utils/clasificarProducto");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Rutas de reglas de prefijo
app.use("/api/reglas-prefijo", reglasPrefijoRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener familias únicas
app.get("/api/familias", async (req, res) => {
  try {
    const familias = await Producto.distinct("familia");
    res.json(familias.sort());
  } catch (error) {
    console.error("Error al obtener familias:", error);
    res.status(500).json({ error: error.message });
  }
});

// Carga masiva de productos
app.post("/api/productos/bulk", async (req, res) => {
  const { tipo, datos } = req.body;

  try {
    if (!Array.isArray(datos)) {
      return res.status(400).json({ error: "El campo 'datos' debe ser un array" });
    }

    // Si es carga total, borra lo anterior
    if (tipo === "total") {
      await Producto.deleteMany({});
    }

    const productosPreparados = [];

    for (const item of datos) {
      const codigo = String(item.codigo || item.barras || "").trim();
      const nombre = String(item.nombre || "").trim();

      const precioRaw = String(item.precio ?? "0").trim().replace(",", ".");
      const precio = Number(precioRaw);

      const clasificacion = await clasificarProducto(codigo);

      productosPreparados.push({
        codigo,
        nombre,
        precio: Number.isFinite(precio) ? precio : 0,
        familia: clasificacion.familia,
        subfamilia: clasificacion.subfamilia,
        activo: true,
      });
    }

    const guardados = await Producto.insertMany(productosPreparados);

    console.log(`Se guardaron ${guardados.length} productos en Atlas`);

    res.json({
      success: true,
      count: guardados.length,
    });
  } catch (error) {
    console.error("Error al guardar productos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar/agregar productos sin borrar todo
app.post("/api/productos/actualizar", async (req, res) => {
  const { datos } = req.body;

  try {
    if (!Array.isArray(datos)) {
      return res.status(400).json({ error: "El campo 'datos' debe ser un array" });
    }

    let actualizados = 0;
    let creados = 0;

    for (const item of datos) {
      const codigo = String(item.codigo || item.barras || "").trim();
      const nombre = String(item.nombre || "").trim();

      const precioRaw = String(item.precio ?? "0").trim().replace(",", ".");
      const precio = Number(precioRaw);

      if (!codigo || !nombre) continue;

      const clasificacion = await clasificarProducto(codigo);

      const existente = await Producto.findOne({ codigo });

      if (existente) {
        existente.nombre = nombre;
        existente.precio = Number.isFinite(precio) ? precio : 0;
        existente.familia = clasificacion.familia;
        existente.subfamilia = clasificacion.subfamilia;
        existente.activo = true;
        await existente.save();
        actualizados++;
      } else {
        await Producto.create({
          codigo,
          nombre,
          precio: Number.isFinite(precio) ? precio : 0,
          familia: clasificacion.familia,
          subfamilia: clasificacion.subfamilia,
          activo: true,
        });
        creados++;
      }
    }

    res.json({
      success: true,
      actualizados,
      creados,
    });
  } catch (error) {
    console.error("Error al actualizar/agregar productos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug-prefijo/:prefijo", async (req, res) => {
  try {
    const prefijo = String(req.params.prefijo || "").toUpperCase().trim();

    const productos = await Producto.find({
      codigo: { $regex: `^${prefijo}`, $options: "i" }
    }).select("codigo nombre familia");

    res.json({
      prefijo,
      cantidad: productos.length,
      productos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

console.log("Intentando conectar a:", process.env.MONGO_URI);

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ ERROR: No se encontró la variable MONGO_URI en el archivo .env");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error de conexión:", err);
  });