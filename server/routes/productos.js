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
  "lima",
  "grafito",
  "oceano",
];
const AVAILABLE_CATEGORY_PALETTES = new Set([
  ...CATEGORY_COLOR_POOL,
  "artistica",
  "productos para chicos",
  "muebles",
  "listoneria",
  "cortineria",
  "molduras",
  "calados y laser",
  "productos varios",
  "sin clasificar",
]);

const BUILT_IN_CATEGORY_PALETTES = {
  artistica: "artistica",
  "productos para chicos": "productos para chicos",
  muebles: "muebles",
  listoneria: "listoneria",
  cortineria: "cortineria",
  molduras: "molduras",
  "calados y laser": "calados y laser",
  "productos varios": "productos varios",
  "sin clasificar": "sin clasificar",
};

const CATEGORY_ALIASES = {
  "calado y laser": "calados y laser",
  laser: "calados y laser",
  "candy bar": "calados y laser",
  "candy bar y laser": "calados y laser",
  "todo para infantiles": "productos para chicos",
};

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

function resolveCategoryPaletteKey(nombre = "") {
  const normalized = normalizeText(nombre);
  const resolved = CATEGORY_ALIASES[normalized] || normalized;

  return BUILT_IN_CATEGORY_PALETTES[resolved] || "";
}

async function ensureCategoryDocumentsWithPalette(categoryNames = []) {
  const nombres = Array.from(
    new Set(categoryNames.map((nombre) => String(nombre || "").trim()).filter(Boolean))
  );

  const categoriasDb = await Categoria.find({}).lean();
  const categoriasPorNombre = new Map(
    categoriasDb.map((categoria) => [categoria.nombre?.trim(), categoria])
  );

  for (const nombre of nombres) {
    const paletteKey = resolveCategoryPaletteKey(nombre);
    const existente = categoriasPorNombre.get(nombre);

    if (existente) {
      if (!existente.colorPalette && paletteKey) {
        const actualizada = await Categoria.findOneAndUpdate(
          { nombre },
          { $set: { colorPalette: paletteKey } },
          { new: true }
        ).lean();
        categoriasPorNombre.set(nombre, actualizada);
      }
      continue;
    }

    const categoriasExistentes = Array.from(categoriasPorNombre.values());
    const colorPalette =
      paletteKey || pickUnusedCategoryPalette(categoriasExistentes, nombre);

    const creada = await Categoria.create({
      nombre,
      colorPalette,
    });

    categoriasPorNombre.set(nombre, creada.toObject());
  }

  return Array.from(categoriasPorNombre.values());
}

function esSinSubcategoria(valor = "") {
  const normalizado = normalizeText(valor);

  return (
    normalizado === "sin subcategoria" ||
    normalizado === "sin subcategora"
  );
}

function cleanValue(value = "") {
  return String(value ?? "").trim();
}

function normalizeCode(value = "") {
  return cleanValue(value).toUpperCase();
}

function parsePrice(value) {
  if (value === null || value === undefined || value === "") return null;

  let text = String(value)
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  if (!text) return null;

  if (text.includes(".") && text.includes(",")) {
    const number = Number(text.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(number) ? Math.floor(number) : null;
  }

  if (text.includes(",") && !text.includes(".")) {
    const number = Number(text.replace(",", "."));
    return Number.isFinite(number) ? Math.floor(number) : null;
  }

  const number = Number(text);
  return Number.isFinite(number) ? Math.floor(number) : null;
}

function normalizeHeader(value = "") {
  return cleanValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getRowValueByMatchers(row = {}, matchers = []) {
  const entry = Object.entries(row).find(([key]) => {
    const header = normalizeHeader(key);
    return matchers.some((matcher) =>
      typeof matcher === "function" ? matcher(header) : header.includes(matcher)
    );
  });

  return entry ? entry[1] : "";
}

function isCodeHeader(header = "") {
  return (
    header.includes("sku") ||
    header.includes("barra") ||
    header.includes("barras") ||
    header.includes("codigo") ||
    header === "cod" ||
    header === "cod." ||
    header.includes("barcode") ||
    header.includes("ean") ||
    header.includes("isbn") ||
    header.includes("gtin") ||
    header.includes("upc")
  );
}

function isTextHeader(header = "") {
  return (
    header.includes("nombre") ||
    header.includes("producto") ||
    header.includes("descripcion") ||
    header.includes("detalle") ||
    header.includes("categoria") ||
    header.includes("subcategoria") ||
    header.includes("sub categoria") ||
    header.includes("rubro") ||
    header.includes("familia")
  );
}

function getBestPriceValue(rawRow = {}) {
  const entries = Object.entries(rawRow || {});

  const prioritized = entries.find(([key, value]) => {
    const header = normalizeHeader(key);
    const parsed = parsePrice(value);

    if (parsed === null) return false;

    return (
      header.includes("precio") ||
      header.includes("price") ||
      header.includes("importe") ||
      header.includes("valor") ||
      header.includes("monto") ||
      header.includes("venta") ||
      header.includes("lista") ||
      header.includes("final") ||
      header.includes("normal") ||
      header.includes("publico") ||
      header.includes("pvp")
    );
  });

  if (prioritized) {
    return prioritized[1];
  }

  const fallbackCandidates = entries.filter(([key, value]) => {
    const header = normalizeHeader(key);

    if (isCodeHeader(header) || isTextHeader(header)) {
      return false;
    }

    return parsePrice(value) !== null;
  });

  if (fallbackCandidates.length === 1) {
    return fallbackCandidates[0][1];
  }

  return "";
}

function extractImportRow(rawRow = {}) {
  const codigo = normalizeCode(
    getRowValueByMatchers(rawRow, [
      "sku",
      "barra",
      "barras",
      "codigo",
      "cod",
      "code",
      (header) => header === "cod.",
    ])
  );

  const precio = parsePrice(getBestPriceValue(rawRow));

  const nombre = cleanValue(
    getRowValueByMatchers(rawRow, ["nombre", "producto", "descripcion", "detalle"])
  );
  const categoria = cleanValue(
    getRowValueByMatchers(rawRow, ["categoria", "rubro", "familia"])
  );
  const subcategoria = cleanValue(
    getRowValueByMatchers(rawRow, ["subcategoria", "sub categoria", "sub-rubro"])
  );

  return {
    codigo,
    precio,
    nombre,
    categoria,
    subcategoria,
  };
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
      subcategoria: p.subcategoria?.trim() || "Sin subcategorÃ­a",
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

    // 1) categorÃ­as creadas manualmente
    categoriasDb.forEach((c) => {
      const nombre = c.nombre?.trim();
      if (!nombre) return;

      categoriasSet.add(nombre);

      if (!subcategoriasPorCategoria[nombre]) {
        subcategoriasPorCategoria[nombre] = new Set();
      }
    });

    // 2) subcategorÃ­as creadas manualmente
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

    // 3) categorÃ­as/subcategorÃ­as ya existentes en productos (Excel / sistema viejo)
    productos.forEach((p) => {
      const categoria = p.categoria?.trim() || "Sin clasificar";
      const subcategoria = p.subcategoria?.trim() || "Sin subcategorÃ­a";

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

    subcategoriasPorCategoria["Sin clasificar"].add("Sin subcategorÃ­a");

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

// Crear categorÃ­a o subcategorÃ­a
router.post("/categorias", async (req, res) => {
  try {
    const { categoria = "", subcategoria = "" } = req.body;

    const categoriaLimpia = categoria.trim();
    const subcategoriaLimpia = subcategoria.trim();

    if (!categoriaLimpia) {
      return res.status(400).json({ error: "La categorÃ­a es obligatoria" });
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
    console.error("Error al crear categorÃ­a/subcategorÃ­a:", error);
    res.status(500).json({ error: "Error al crear categorÃ­a/subcategorÃ­a" });
  }
});

router.patch("/categorias/:nombre", async (req, res) => {
  try {
    const nombreActual = decodeURIComponent(req.params.nombre).trim();
    const nuevoNombre = (req.body.nuevoNombre || "").trim();
    const colorPalette = (req.body.colorPalette || "").trim();

    if (!nombreActual || !nuevoNombre) {
      return res.status(400).json({ error: "Los nombres son obligatorios" });
    }

    if (normalizeText(nombreActual) === "sin clasificar") {
      return res
        .status(400)
        .json({ error: "No se puede editar esa categorÃ­a" });
    }

    if (normalizeText(nuevoNombre) === "sin clasificar") {
      return res
        .status(400)
        .json({ error: "Ese nombre no se puede usar" });
    }

    if (colorPalette && !AVAILABLE_CATEGORY_PALETTES.has(colorPalette)) {
      return res.status(400).json({ error: "Color de categoría inválido" });
    }

    const categoriaActual = await Categoria.findOne({ nombre: nombreActual });
    const productosConCategoria = await Producto.countDocuments({
      categoria: nombreActual,
    });
    const subcategoriasConCategoria = await Subcategoria.countDocuments({
      categoria: nombreActual,
    });

    if (!categoriaActual && !productosConCategoria && !subcategoriasConCategoria) {
      return res.status(404).json({ error: "CategorÃ­a no encontrada" });
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
      return res.status(400).json({ error: "La categorÃ­a ya existe" });
    }

    if (categoriaActual) {
      categoriaActual.nombre = nuevoNombre;
      if (colorPalette) {
        categoriaActual.colorPalette = colorPalette;
      }
      await categoriaActual.save();
    } else if (!categoriaDuplicada) {
      const categoriasExistentes = await Categoria.find({}, "colorPalette").lean();
      await Categoria.create({
        nombre: nuevoNombre,
        colorPalette:
          colorPalette ||
          pickUnusedCategoryPalette(categoriasExistentes, nuevoNombre),
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
      colorPalette:
        (categoriaActual && categoriaActual.colorPalette) || colorPalette || "",
      productosActualizados:
        resultadoProductos.modifiedCount ?? resultadoProductos.nModified ?? 0,
    });
  } catch (error) {
    console.error("Error al actualizar categorÃ­a:", error);
    res.status(500).json({ error: "Error al actualizar categorÃ­a" });
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
      subcategoria: p.subcategoria?.trim() || "Sin subcategorÃ­a",
    }));

    res.json(normalizados);
  } catch (error) {
    console.error("Error al obtener sin clasificar:", error);
    res.status(500).json({ error: "Error al obtener sin clasificar" });
  }
});

router.post("/importar-precios", async (req, res) => {
  try {
    const filas = Array.isArray(req.body?.filas) ? req.body.filas : [];

    if (!filas.length) {
      return res.status(400).json({ error: "No se recibieron filas para importar" });
    }

    let actualizados = 0;
    let creados = 0;
    let sinCodigo = 0;
    let sinPrecio = 0;

    const categoriasDetectadas = new Set();

    for (const fila of filas) {
      const { codigo, precio, nombre, categoria, subcategoria } = extractImportRow(fila);

      if (!codigo) {
        sinCodigo += 1;
        continue;
      }

      const productoExistente = await Producto.findOne({ codigo });

      if (productoExistente) {
        if (precio === null) {
          sinPrecio += 1;
          continue;
        }

        productoExistente.precio = precio;
        await productoExistente.save();
        actualizados += 1;
        continue;
      }

      const nuevoProducto = await Producto.create({
        codigo,
        nombre: nombre || codigo,
        precio: precio ?? 0,
        categoria,
        subcategoria,
        activo: true,
      });

      if (nuevoProducto.categoria) {
        categoriasDetectadas.add(nuevoProducto.categoria);
      }

      creados += 1;
    }

    if (categoriasDetectadas.size) {
      await ensureCategoryDocumentsWithPalette(Array.from(categoriasDetectadas));
    }

    res.json({
      ok: true,
      actualizados,
      creados,
      sinCodigo,
      sinPrecio,
      filasProcesadas: filas.length,
    });
  } catch (error) {
    console.error("Error al importar precios:", error);
    res.status(500).json({ error: "Error al importar precios" });
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
          usuarioNombre: item.usuarioNombre || "",
          usuarioEmail: item.usuarioEmail || "",
          fecha: item.createdAt,
        }))
      );
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// Guardar acciÃ³n en historial
router.post("/historial", async (req, res) => {
  try {
      const {
        tipo,
        descripcion,
        cantidad = 0,
        categoria = "",
        subcategoria = "",
      } = req.body;
      const usuarioNombre = req.authUser?.nombre || "";
      const usuarioEmail = req.authUser?.email || "";

    if (!tipo?.trim() || !descripcion?.trim()) {
      return res
        .status(400)
        .json({ error: "Tipo y descripciÃ³n son obligatorios" });
    }

      const nuevaAccion = await HistorialAccion.create({
        tipo: tipo.trim(),
        descripcion: descripcion.trim(),
        cantidad,
        categoria: categoria.trim(),
        subcategoria: subcategoria.trim(),
        usuarioNombre,
        usuarioEmail,
      });

      res.status(201).json({
        id: nuevaAccion._id,
        tipo: nuevaAccion.tipo,
        descripcion: nuevaAccion.descripcion,
        cantidad: nuevaAccion.cantidad,
        categoria: nuevaAccion.categoria,
        subcategoria: nuevaAccion.subcategoria,
        usuarioNombre: nuevaAccion.usuarioNombre || "",
        usuarioEmail: nuevaAccion.usuarioEmail || "",
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

// Actualizar clasificaciÃ³n de mÃºltiples productos
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
      message: "ClasificaciÃ³n mÃºltiple actualizada correctamente",
      modifiedCount: resultado.modifiedCount ?? resultado.nModified ?? 0,
      matchedCount: resultado.matchedCount ?? resultado.n ?? 0,
    });
  } catch (error) {
    console.error("Error al actualizar clasificaciÃ³n mÃºltiple:", error);
    res.status(500).json({ error: "Error al actualizar clasificaciÃ³n mÃºltiple" });
  }
});

// Actualizar clasificaciÃ³n de un producto
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
        productoActualizado.subcategoria?.trim() || "Sin subcategorÃ­a",
    });
  } catch (error) {
    console.error("Error al actualizar clasificaciÃ³n:", error);
    res.status(500).json({ error: "Error al actualizar clasificaciÃ³n" });
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
      return res.status(400).json({ error: "Nombre de categorÃ­a invÃ¡lido" });
    }

    if (nombre.toLowerCase() === "sin clasificar") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar esa categorÃ­a" });
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
    console.error("Error al eliminar categorÃ­a:", error);
    res.status(500).json({ error: "Error al eliminar categorÃ­a" });
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
        error: "CategorÃ­a y subcategorÃ­a actuales, mÃ¡s los nuevos datos, son obligatorios",
      });
    }

    if (esSinSubcategoria(subcategoriaActualLimpia) || esSinSubcategoria(nuevoNombreLimpio)) {
      return res
        .status(400)
        .json({ error: "Ese nombre no se puede usar para una subcategorÃ­a" });
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
      return res.status(404).json({ error: "SubcategorÃ­a no encontrada" });
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
        error: "Ya existe una subcategorÃ­a con ese nombre en la categorÃ­a destino",
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
    console.error("Error al actualizar subcategorÃ­a:", error);
    res.status(500).json({ error: "Error al actualizar subcategorÃ­a" });
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
        .json({ error: "CategorÃ­a y subcategorÃ­a son obligatorias" });
    }

    if (subcategoriaLimpia.toLowerCase() === "sin subcategorÃ­a") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar esa subcategorÃ­a" });
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
    console.error("Error al eliminar subcategorÃ­a:", error);
    res.status(500).json({ error: "Error al eliminar subcategorÃ­a" });
  }
});

module.exports = router;

