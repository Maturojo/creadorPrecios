require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Producto = require("../../models/Producto.js");

const filePath = path.resolve("src/seed/productosCategorias.csv");

function limpiar(valor) {
  return String(valor || "").trim();
}

function normalizarCodigo(valor) {
  return limpiar(valor).toUpperCase();
}

function parsearPrecio(valor) {
  if (valor === null || valor === undefined || valor === "") return null;

  let texto = String(valor).trim();

  texto = texto
    .replace(/^"|"$/g, "")
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  // 23.717,505
  if (texto.includes(".") && texto.includes(",")) {
    const numero = Number(texto.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? Math.floor(numero) : null;
  }

  // 23717,505
  if (texto.includes(",") && !texto.includes(".")) {
    const numero = Number(texto.replace(",", "."));
    return Number.isFinite(numero) ? Math.floor(numero) : null;
  }

  // 23717.505
  if (texto.includes(".") && !texto.includes(",")) {
    const numero = Number(texto);
    return Number.isFinite(numero) ? Math.floor(numero) : null;
  }

  const numero = Number(texto);
  return Number.isFinite(numero) ? Math.floor(numero) : null;
}

function obtenerCategoriaYSub(categoriasRaw) {
  const texto = limpiar(categoriasRaw);

  if (!texto) {
    return { categoria: "", subcategoria: "" };
  }

  const partes = texto
    .split(",")
    .map((p) => limpiar(p))
    .filter(Boolean);

  const jerarquia = partes.find((p) => p.includes(">"));

  if (jerarquia) {
    const niveles = jerarquia
      .split(">")
      .map((p) => limpiar(p))
      .filter(Boolean);

    return {
      categoria: niveles[0] || "",
      subcategoria: niveles[1] || "",
    };
  }

  if (partes.length >= 2) {
    return {
      categoria: partes[0] || "",
      subcategoria: partes[1] || "",
    };
  }

  return {
    categoria: partes[0] || "",
    subcategoria: "",
  };
}

// Parser simple de CSV con soporte para comillas
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCSV(content) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (!lines.length) return [];

  const headers = parseCSVLine(lines[0]).map((h) => limpiar(h));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Falta MONGODB_URI o MONGO_URI en .env");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Mongo conectado");

    const csvContent = fs.readFileSync(filePath, "utf-8");
    const rows = parseCSV(csvContent);

    let actualizados = 0;
    let noEncontrados = 0;
    let sinCodigo = 0;

    const reporteNoEncontrados = [];
    const reporteActualizados = [];

    for (const row of rows) {
      const codigo = normalizarCodigo(row.SKU);

      if (!codigo) {
        sinCodigo++;
        continue;
      }

      const nombre = limpiar(row.Nombre);
      const precioOriginal = row["Precio normal"];
      const precio = parsearPrecio(precioOriginal);
      const { categoria, subcategoria } = obtenerCategoriaYSub(row["Categorías"]);

      const producto = await Producto.findOne({ codigo });

      if (!producto) {
        noEncontrados++;
        reporteNoEncontrados.push({
          codigo,
          nombreCsv: nombre,
          precioOriginal,
          precioParseado: precio,
          categoriaCsv: categoria,
          subcategoriaCsv: subcategoria,
        });
        continue;
      }

      const update = {};

      if (nombre) update.nombre = nombre;
      if (precio !== null) update.precio = precio;
      if (categoria) update.categoria = categoria;
      if (subcategoria) update.subcategoria = subcategoria;

      if (Object.keys(update).length === 0) continue;

      await Producto.updateOne({ _id: producto._id }, { $set: update });

      actualizados++;
      reporteActualizados.push({
        codigo,
        precioOriginal,
        precioGuardado: update.precio ?? producto.precio,
        nombre: update.nombre ?? producto.nombre,
        categoria: update.categoria ?? producto.categoria ?? "",
        subcategoria: update.subcategoria ?? producto.subcategoria ?? "",
      });

      console.log(
        `✅ ${codigo} | precio original: ${precioOriginal} -> guardado: ${
          update.precio ?? producto.precio
        }`
      );
    }

    fs.writeFileSync(
      path.resolve("src/seed/reporte-no-encontrados.json"),
      JSON.stringify(reporteNoEncontrados, null, 2),
      "utf-8"
    );

    fs.writeFileSync(
      path.resolve("src/seed/reporte-actualizados.json"),
      JSON.stringify(reporteActualizados, null, 2),
      "utf-8"
    );

    console.log("\n----- RESUMEN -----");
    console.log("Actualizados:", actualizados);
    console.log("No encontrados:", noEncontrados);
    console.log("Sin código:", sinCodigo);
    console.log("📁 Reportes generados en src/seed");

    await mongoose.disconnect();
    console.log("🔌 Mongo desconectado");
  } catch (error) {
    console.error("❌ Error:", error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

run();