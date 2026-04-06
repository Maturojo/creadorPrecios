const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");
const HistorialAccion = require("../models/HistorialAccion");
const Categoria = require("../models/Categoria");
const Subcategoria = require("../models/Subcategoria");

const CATEGORY_COLOR_POOL = [
  "ambar",
  "frambuesa",
  "bosque",
  "petroleo",
  "mostaza",
  "ciruela",
  "coral",
  "oliva",
  "cobre",
  "oceano",
];

function normalizeText(value = "") {
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getHashIndex(value, length) {
  const normalized = normalizeText(value);

  if (!normalized || length <= 1) return 0;

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  return hash % length;
}

function pickUnusedCategoryPalette(categorias = [], categoriaNombre = "") {
  const usados = new Set(
    categorias.map((categoria) => categoria.colorPalette).filter(Boolean)
  );

  const libre = CATEGORY_COLOR_POOL.find((palette) => !usados.has(palette));
  if (libre) return libre;

  return CATEGORY_COLOR_POOL[getHashIndex(categoriaNombre, CATEGORY_COLOR_POOL.length)];
}

function esSinSubcategoria(valor = "") {
  const normalizado = normalizeText(valor);

  return (
    normalizado === "sin subcategoria" ||
    normalizado === "sin subcategora"
  );
}

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
      if (esSinSubcategoria(subcategoria)) {
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

    const coloresCategorias = categoriasDb.reduce((acc, categoria) => {
      const nombre = categoria.nombre?.trim();
      const colorPalette = categoria.colorPalette?.trim();

      if (nombre && colorPalette) {
        acc[nombre] = colorPalette;
      }

      return acc;
    }, {});

    res.json({
      categorias,
      subcategorias,
      coloresCategorias,
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
      const categoriasExistentes = await Categoria.find({}, "colorPalette").lean();
      const colorPalette = pickUnusedCategoryPalette(
        categoriasExistentes,
        categoriaLimpia
      );

      categoriaDoc = await Categoria.create({
        nombre: categoriaLimpia,
        colorPalette,
      });
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
      colorPalette: categoriaDoc.colorPalette || "",
    });
  } catch (error) {
    console.error("Error al crear categoría/subcategoría:", error);
    res.status(500).json({ error: "Error al crear categoría/subcategoría" });
  }
});

router.patch("/categorias/:nombre", async (req, res) => {
  try {
    const nombreActual = decodeURIComponent(req.params.nombre).trim();
    const nuevoNombre = (req.body.nuevoNombre || "").trim();

    if (!nombreActual || !nuevoNombre) {
      return res.status(400).json({ error: "Los nombres son obligatorios" });
    }

    if (normalizeText(nombreActual) === "sin clasificar") {
      return res
        .status(400)
        .json({ error: "No se puede editar esa categoría" });
    }

    if (normalizeText(nuevoNombre) === "sin clasificar") {
      return res
        .status(400)
        .json({ error: "Ese nombre no se puede usar" });
    }

    const categoriaActual = await Categoria.findOne({ nombre: nombreActual });
    const productosConCategoria = await Producto.countDocuments({
      categoria: nombreActual,
    });
    const subcategoriasConCategoria = await Subcategoria.countDocuments({
      categoria: nombreActual,
    });

    if (!categoriaActual && !productosConCategoria && !subcategoriasConCategoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const categoriaDuplicada = await Categoria.findOne({ nombre: nuevoNombre });
    const productosConNuevoNombre = await Producto.countDocuments({
      categoria: nuevoNombre,
    });
    const subcategoriasConNuevoNombre = await Subcategoria.countDocuments({
      categoria: nuevoNombre,
    });

    if (
      normalizeText(nombreActual) !== normalizeText(nuevoNombre) &&
      (categoriaDuplicada || productosConNuevoNombre || subcategoriasConNuevoNombre)
    ) {
      return res.status(400).json({ error: "La categoría ya existe" });
    }

    if (categoriaActual) {
      categoriaActual.nombre = nuevoNombre;
      await categoriaActual.save();
    } else if (!categoriaDuplicada) {
      const categoriasExistentes = await Categoria.find({}, "colorPalette").lean();
      await Categoria.create({
        nombre: nuevoNombre,
        colorPalette: pickUnusedCategoryPalette(categoriasExistentes, nuevoNombre),
      });
    }

    await Subcategoria.updateMany(
      { categoria: nombreActual },
      { $set: { categoria: nuevoNombre } }
    );

    const resultadoProductos = await Producto.updateMany(
      { categoria: nombreActual },
      { $set: { categoria: nuevoNombre } }
    );

    res.json({
      ok: true,
      categoriaAnterior: nombreActual,
      categoriaActualizada: nuevoNombre,
      productosActualizados:
        resultadoProductos.modifiedCount ?? resultadoProductos.nModified ?? 0,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar categoría" });
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

router.delete("/categorias/:nombre", async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre).trim();

    if (!nombre) {
      return res.status(400).json({ error: "Nombre de categoría inválido" });
    }

    if (nombre.toLowerCase() === "sin clasificar") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar esa categoría" });
    }

    await Categoria.deleteOne({ nombre });
    await Subcategoria.deleteMany({ categoria: nombre });

    const resultadoProductos = await Producto.updateMany(
      { categoria: nombre },
      {
        $set: {
          categoria: "",
          subcategoria: "",
        },
      }
    );

    res.json({
      ok: true,
      categoriaEliminada: nombre,
      productosActualizados:
        resultadoProductos.modifiedCount ?? resultadoProductos.nModified ?? 0,
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});

router.patch("/subcategorias", async (req, res) => {
  try {
    const {
      categoriaActual = "",
      subcategoriaActual = "",
      nuevaCategoria = "",
      nuevoNombre = "",
    } = req.body;

    const categoriaActualLimpia = categoriaActual.trim();
    const subcategoriaActualLimpia = subcategoriaActual.trim();
    const nuevaCategoriaLimpia = nuevaCategoria.trim();
    const nuevoNombreLimpio = nuevoNombre.trim();

    if (
      !categoriaActualLimpia ||
      !subcategoriaActualLimpia ||
      !nuevaCategoriaLimpia ||
      !nuevoNombreLimpio
    ) {
      return res.status(400).json({
        error: "Categoría y subcategoría actuales, más los nuevos datos, son obligatorios",
      });
    }

    if (esSinSubcategoria(subcategoriaActualLimpia) || esSinSubcategoria(nuevoNombreLimpio)) {
      return res
        .status(400)
        .json({ error: "Ese nombre no se puede usar para una subcategoría" });
    }

    const subcategoriaDoc = await Subcategoria.findOne({
      categoria: categoriaActualLimpia,
      nombre: subcategoriaActualLimpia,
    });
    const productosConSubcategoria = await Producto.countDocuments({
      categoria: categoriaActualLimpia,
      subcategoria: subcategoriaActualLimpia,
    });

    if (!subcategoriaDoc && !productosConSubcategoria) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }

    const subcategoriaDuplicada = await Subcategoria.findOne({
      categoria: nuevaCategoriaLimpia,
      nombre: nuevoNombreLimpio,
    });

    if (
      subcategoriaDuplicada &&
      !(
        subcategoriaDuplicada.categoria === categoriaActualLimpia &&
        subcategoriaDuplicada.nombre === subcategoriaActualLimpia
      )
    ) {
      return res.status(400).json({
        error: "Ya existe una subcategoría con ese nombre en la categoría destino",
      });
    }

    let categoriaDestino = await Categoria.findOne({ nombre: nuevaCategoriaLimpia });
    if (!categoriaDestino) {
      const categoriasExistentes = await Categoria.find({}, "colorPalette").lean();
      categoriaDestino = await Categoria.create({
        nombre: nuevaCategoriaLimpia,
        colorPalette: pickUnusedCategoryPalette(
          categoriasExistentes,
          nuevaCategoriaLimpia
        ),
      });
    }

    if (subcategoriaDoc) {
      subcategoriaDoc.categoria = nuevaCategoriaLimpia;
      subcategoriaDoc.nombre = nuevoNombreLimpio;
      await subcategoriaDoc.save();
    } else if (!subcategoriaDuplicada) {
      await Subcategoria.create({
        categoria: nuevaCategoriaLimpia,
        nombre: nuevoNombreLimpio,
      });
    }

    const resultadoProductos = await Producto.updateMany(
      {
        categoria: categoriaActualLimpia,
        subcategoria: subcategoriaActualLimpia,
      },
      {
        $set: {
          categoria: nuevaCategoriaLimpia,
          subcategoria: nuevoNombreLimpio,
        },
      }
    );

    res.json({
      ok: true,
      categoriaAnterior: categoriaActualLimpia,
      subcategoriaAnterior: subcategoriaActualLimpia,
      categoriaNueva: nuevaCategoriaLimpia,
      subcategoriaNueva: nuevoNombreLimpio,
      productosActualizados:
        resultadoProductos.modifiedCount ?? resultadoProductos.nModified ?? 0,
      colorPalette: categoriaDestino.colorPalette || "",
    });
  } catch (error) {
    console.error("Error al actualizar subcategoría:", error);
    res.status(500).json({ error: "Error al actualizar subcategoría" });
  }
});

router.delete("/subcategorias", async (req, res) => {
  try {
    const { categoria = "", subcategoria = "" } = req.body;

    const categoriaLimpia = categoria.trim();
    const subcategoriaLimpia = subcategoria.trim();

    if (!categoriaLimpia || !subcategoriaLimpia) {
      return res
        .status(400)
        .json({ error: "Categoría y subcategoría son obligatorias" });
    }

    if (subcategoriaLimpia.toLowerCase() === "sin subcategoría") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar esa subcategoría" });
    }

    await Subcategoria.deleteOne({
      categoria: categoriaLimpia,
      nombre: subcategoriaLimpia,
    });

    const resultadoProductos = await Producto.updateMany(
      {
        categoria: categoriaLimpia,
        subcategoria: subcategoriaLimpia,
      },
      {
        $set: {
          subcategoria: "",
        },
      }
    );

    res.json({
      ok: true,
      categoria: categoriaLimpia,
      subcategoriaEliminada: subcategoriaLimpia,
      productosActualizados:
        resultadoProductos.modifiedCount ?? resultadoProductos.nModified ?? 0,
    });
  } catch (error) {
    console.error("Error al eliminar subcategoría:", error);
    res.status(500).json({ error: "Error al eliminar subcategoría" });
  }
});

module.exports = router;
