const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const { q = "", categoria = "", subcategoria = "" } = req.query;

    const filtro = {};

    if (q.trim()) {
      filtro.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { codigo: { $regex: q, $options: "i" } },
      ];
    }

    if (categoria.trim()) {
      filtro.categoria = categoria;
    }

    if (subcategoria.trim()) {
      filtro.subcategoria = subcategoria;
    }

    const productos = await Producto.find(filtro).sort({ nombre: 1 }).lean();

    const normalizados = productos.map((p) => ({
      ...p,
      categoria: p.categoria?.trim() || "Sin clasificar",
      subcategoria: p.subcategoria?.trim() || "Sin subcategoría",
    }));

    res.json(normalizados);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Obtener filtros
router.get("/filtros", async (req, res) => {
  try {
    const productos = await Producto.find({}, "categoria subcategoria").lean();

    const categoriasSet = new Set();
    const subcategoriasPorCategoria = {};

    productos.forEach((p) => {
      const categoria = p.categoria?.trim() || "Sin clasificar";
      const subcategoria = p.subcategoria?.trim() || "Sin subcategoría";

      categoriasSet.add(categoria);

      if (!subcategoriasPorCategoria[categoria]) {
        subcategoriasPorCategoria[categoria] = new Set();
      }

      subcategoriasPorCategoria[categoria].add(subcategoria);
    });

    const categorias = Array.from(categoriasSet).sort((a, b) =>
      a.localeCompare(b, "es")
    );

    const subcategorias = {};
    for (const cat of Object.keys(subcategoriasPorCategoria)) {
      subcategorias[cat] = Array.from(subcategoriasPorCategoria[cat]).sort((a, b) =>
        a.localeCompare(b, "es")
      );
    }

    res.json({
      categorias,
      subcategorias,
    });
  } catch (error) {
    console.error("Error al obtener filtros:", error);
    res.status(500).json({ error: "Error al obtener filtros" });
  }
});

// Obtener productos sin clasificar
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