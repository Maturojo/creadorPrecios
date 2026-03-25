const express = require("express");
const router = express.Router();
const ReglaPrefijo = require("../models/ReglaPrefijo");
const Producto = require("../models/Producto");
const clasificarProducto = require("../utils/clasificarProducto");

// GET
router.get("/", async (req, res) => {
  console.log("👉 GET /api/reglas-prefijo");
  try {
    const reglas = await ReglaPrefijo.find().sort({ prefijo: 1 });
    console.log("✅ reglas encontradas:", reglas.length);
    res.json(reglas);
  } catch (error) {
    console.error("❌ error GET reglas-prefijo:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST
router.post("/", async (req, res) => {
  console.log("👉 POST /api/reglas-prefijo");
  console.log("BODY:", req.body);

  try {
    const { prefijo, familia, subfamilia, descripcion } = req.body;

    const nueva = await ReglaPrefijo.create({
      prefijo: String(prefijo || "").toUpperCase().trim(),
      familia: String(familia || "").trim(),
      subfamilia: String(subfamilia || "").trim(),
      descripcion: String(descripcion || "").trim(),
      activo: true,
    });

    console.log("✅ regla creada:", nueva);

    res.json(nueva);
  } catch (error) {
    console.error("❌ error POST reglas-prefijo:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  console.log("👉 DELETE /api/reglas-prefijo/:id", req.params.id);
  try {
    await ReglaPrefijo.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ error DELETE reglas-prefijo:", error);
    res.status(500).json({ error: error.message });
  }
});

// REAPLICAR
router.post("/reaplicar", async (req, res) => {
  console.log("👉 POST /api/reglas-prefijo/reaplicar");
  try {
    const productos = await Producto.find();
    let actualizados = 0;

    for (const producto of productos) {
      const clasificacion = await clasificarProducto(producto.codigo);

      await Producto.findByIdAndUpdate(producto._id, {
        familia: clasificacion.familia,
        subfamilia: clasificacion.subfamilia,
      });

      actualizados++;
    }

    res.json({ ok: true, actualizados });
  } catch (error) {
    console.error("❌ error REAPLICAR reglas-prefijo:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;