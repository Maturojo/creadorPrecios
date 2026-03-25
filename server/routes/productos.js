const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

router.get("/sin-clasificar", async (req, res) => {
  try {
    const productos = await Producto.find({
      $or: [
        { categoria: { $exists: false } },
        { categoria: null },
        { categoria: "" },
      ],
    })
      .sort({ nombre: 1 })
      .lean();

    const normalizados = productos.map((p) => ({
      ...p,
      categoria: p.categoria?.trim() || "Sin clasificar",
      subcategoria: p.subcategoria?.trim() || "Sin subcategoría",
    }));

    res.json(normalizados);
  } catch (error) {
    console.error("Error al obtener sin clasificar:", error);
    res.status(500).json({ error: "Error al obtener sin clasificar" });
  }
});

module.exports = router;