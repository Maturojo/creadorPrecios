const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");
const HistorialAccion = require("../models/HistorialAccion");
const Categoria = require("../models/Categoria");
const Subcategoria = require("../models/Subcategoria");

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const { q = "", categoria = "", subcategoria = "" } = req.query;

    const condiciones = [];

    if (q.trim()) {
      condiciones.push({
        $or: [
          { nombre: { $regex: q, $options: "i" } },
          { codigo: { $regex: q, $options: "i" } },
        ],
      });
    }

    if (categoria.trim()) {
      if (categoria === "Sin clasificar") {
        condiciones.push({
          $or: [
            { categoria: { $exists: false } },
            { categoria: null },
            { categoria: "" },
          ],
        });
      } else {
        condiciones.push({ categoria });
      }
    }

    if (subcategoria.trim()) {
      if (subcategoria === "Sin subcategoría") {
        condiciones.push({
          $or: [
            { subcategoria: { $exists: false } },
            { subcategoria: null },
            { subcategoria: "" },
          ],
        });
      } else {
        condiciones.push({ subcategoria });
      }
    }

    const filtro = condiciones.length ? { $and: condiciones } : {};

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
    const categoriasDb = await Categoria.find({}).lean();
    const subcategoriasDb = await Subcategoria.find({}).lean();
    const productos = await Producto.find({}, "categoria subcategoria").lean();

    const categoriasSet = new Set();
    const subcategoriasPorCategoria = {};

    // 1) categorías creadas manualmente
    categoriasDb.forEach((c) => {
      const nombre = c.nombre?.trim();
      if (!nombre) return;

      categoriasSet.add(nombre);

      if (!subcategoriasPorCategoria[nombre]) {
        subcategoriasPorCategoria[nombre] = new Set();
      }
    });

    // 2) subcategorías creadas manualmente
    subcategoriasDb.forEach((s) => {
      const categoria = s.categoria?.trim();
      const nombre = s.nombre?.trim();

      if (!categoria || !nombre) return;

      categoriasSet.add(categoria);

      if (!subcategoriasPorCategoria[categoria]) {
        subcategoriasPorCategoria[categoria] = new Set();
      }

      subcategoriasPorCategoria[categoria].add(nombre);
    });

    // 3) categorías/subcategorías ya existentes en productos (Excel / sistema viejo)
    productos.forEach((p) => {
      const categoria = p.categoria?.trim() || "Sin clasificar";
      const subcategoria = p.subcategoria?.trim() || "Sin subcategoría";

      categoriasSet.add(categoria);

      if (!subcategoriasPorCategoria[categoria]) {
        subcategoriasPorCategoria[categoria] = new Set();
      }

      subcategoriasPorCategoria[categoria].add(subcategoria);
    });

    // asegurar que exista Sin clasificar
    categoriasSet.add("Sin clasificar");

    if (!subcategoriasPorCategoria["Sin clasificar"]) {
      subcategoriasPorCategoria["Sin clasificar"] = new Set();
    }

    subcategoriasPorCategoria["Sin clasificar"].add("Sin subcategoría");

    const categorias = Array.from(categoriasSet).sort((a, b) =>
      a.localeCompare(b, "es")
    );

    const subcategorias = {};
    for (const cat of Object.keys(subcategoriasPorCategoria)) {
      subcategorias[cat] = Array.from(subcategoriasPorCategoria[cat]).sort(
        (a, b) => a.localeCompare(b, "es")
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

// Crear categoría o subcategoría
router.post("/categorias", async (req, res) => {
  try {
    const { categoria = "", subcategoria = "" } = req.body;

    const categoriaLimpia = categoria.trim();
    const subcategoriaLimpia = subcategoria.trim();

    if (!categoriaLimpia) {
      return res.status(400).json({ error: "La categoría es obligatoria" });
    }

    let categoriaDoc = await Categoria.findOne({ nombre: categoriaLimpia });

    if (!categoriaDoc) {
      categoriaDoc = await Categoria.create({ nombre: categoriaLimpia });
    }

    if (subcategoriaLimpia) {
      const subExistente = await Subcategoria.findOne({
        nombre: subcategoriaLimpia,
        categoria: categoriaLimpia,
      });

      if (!subExistente) {
        await Subcategoria.create({
          nombre: subcategoriaLimpia,
          categoria: categoriaLimpia,
        });
      }
    }

    res.status(201).json({
      ok: true,
      categoria: categoriaLimpia,
      subcategoria: subcategoriaLimpia,
    });
  } catch (error) {
    console.error("Error al crear categoría/subcategoría:", error);
    res.status(500).json({ error: "Error al crear categoría/subcategoría" });
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

// Obtener historial
router.get("/historial", async (req, res) => {
  try {
    const historial = await HistorialAccion.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(
      historial.map((item) => ({
        id: item._id,
        tipo: item.tipo,
        descripcion: item.descripcion,
        cantidad: item.cantidad || 0,
        categoria: item.categoria || "",
        subcategoria: item.subcategoria || "",
        fecha: item.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// Guardar acción en historial
router.post("/historial", async (req, res) => {
  try {
    const {
      tipo,
      descripcion,
      cantidad = 0,
      categoria = "",
      subcategoria = "",
    } = req.body;

    if (!tipo?.trim() || !descripcion?.trim()) {
      return res
        .status(400)
        .json({ error: "Tipo y descripción son obligatorios" });
    }

    const nuevaAccion = await HistorialAccion.create({
      tipo: tipo.trim(),
      descripcion: descripcion.trim(),
      cantidad,
      categoria: categoria.trim(),
      subcategoria: subcategoria.trim(),
    });

    res.status(201).json({
      id: nuevaAccion._id,
      tipo: nuevaAccion.tipo,
      descripcion: nuevaAccion.descripcion,
      cantidad: nuevaAccion.cantidad,
      categoria: nuevaAccion.categoria,
      subcategoria: nuevaAccion.subcategoria,
      fecha: nuevaAccion.createdAt,
    });
  } catch (error) {
    console.error("Error al guardar historial:", error);
    res.status(500).json({ error: "Error al guardar historial" });
  }
});

// Limpiar historial
router.delete("/historial", async (req, res) => {
  try {
    const resultado = await HistorialAccion.deleteMany({});

    res.json({
      ok: true,
      deletedCount: resultado.deletedCount || 0,
    });
  } catch (error) {
    console.error("Error al limpiar historial:", error);
    res.status(500).json({ error: "Error al limpiar historial" });
  }
});

// Actualizar clasificación de múltiples productos
router.patch("/clasificacion-multiple", async (req, res) => {
  try {
    const { ids, categoria, subcategoria } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No se enviaron productos" });
    }

    const update = {
      categoria: (categoria || "").trim(),
      subcategoria: (subcategoria || "").trim(),
    };

    const resultado = await Producto.updateMany(
      { _id: { $in: ids } },
      { $set: update }
    );

    res.json({
      ok: true,
      message: "Clasificación múltiple actualizada correctamente",
      modifiedCount: resultado.modifiedCount ?? resultado.nModified ?? 0,
      matchedCount: resultado.matchedCount ?? resultado.n ?? 0,
    });
  } catch (error) {
    console.error("Error al actualizar clasificación múltiple:", error);
    res.status(500).json({ error: "Error al actualizar clasificación múltiple" });
  }
});

// Actualizar clasificación de un producto
router.patch("/:id/clasificacion", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, subcategoria } = req.body;

    const update = {
      categoria: (categoria || "").trim(),
      subcategoria: (subcategoria || "").trim(),
    };

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      ...productoActualizado,
      categoria: productoActualizado.categoria?.trim() || "Sin clasificar",
      subcategoria:
        productoActualizado.subcategoria?.trim() || "Sin subcategoría",
    });
  } catch (error) {
    console.error("Error al actualizar clasificación:", error);
    res.status(500).json({ error: "Error al actualizar clasificación" });
  }
});

router.post("/migrar-filtros-desde-productos", async (req, res) => {
  try {
    const productos = await Producto.find({}, "categoria subcategoria").lean();

    let categoriasCreadas = 0;
    let subcategoriasCreadas = 0;

    for (const p of productos) {
      const categoria = p.categoria?.trim();
      const subcategoria = p.subcategoria?.trim();

      if (categoria) {
        const categoriaExistente = await Categoria.findOne({ nombre: categoria });

        if (!categoriaExistente) {
          await Categoria.create({ nombre: categoria });
          categoriasCreadas++;
        }
      }

      if (categoria && subcategoria) {
        const subExistente = await Subcategoria.findOne({
          categoria,
          nombre: subcategoria,
        });

        if (!subExistente) {
          await Subcategoria.create({
            categoria,
            nombre: subcategoria,
          });
          subcategoriasCreadas++;
        }
      }
    }

    res.json({
      ok: true,
      categoriasCreadas,
      subcategoriasCreadas,
    });
  } catch (error) {
    console.error("Error al migrar filtros desde productos:", error);
    res.status(500).json({
      error: "Error al migrar filtros desde productos",
    });
  }
});

module.exports = router;