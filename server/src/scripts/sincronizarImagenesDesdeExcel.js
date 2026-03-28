require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Producto = require("../../models/Producto");

const defaultFilePath = path.resolve("src/seed/productosCategorias.csv");

function limpiar(valor) {
  return String(valor || "").trim();
}

function normalizarCodigo(valor) {
  return limpiar(valor).toUpperCase();
}

function normalizarHeader(header) {
  return limpiar(header)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function esUrlValida(valor) {
  return /^https?:\/\//i.test(limpiar(valor));
}

function obtenerPrimeraUrl(valor) {
  const candidatos = String(valor || "")
    .split(",")
    .map((item) => limpiar(item))
    .filter(Boolean);

  return candidatos.find((item) => esUrlValida(item)) || "";
}

function obtenerImagenUrl(row) {
  const entry = Object.entries(row).find(([header, value]) => {
    const normalizado = normalizarHeader(header);
    const esColumnaImagen =
      normalizado.includes("imagen") ||
      normalizado.includes("foto") ||
      (normalizado.includes("link") && normalizado.includes("imagen")) ||
      (normalizado.includes("url") && normalizado.includes("imagen")) ||
      (normalizado.includes("link") && normalizado.includes("foto")) ||
      (normalizado.includes("url") && normalizado.includes("foto"));

    return esColumnaImagen && esUrlValida(value);
  });

  return entry ? obtenerPrimeraUrl(entry[1]) : "";
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
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

  const headers = parseCSVLine(lines[0]).map((header) => limpiar(header));

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

async function run() {
  try {
    const filePath = process.argv[2]
      ? path.resolve(process.argv[2])
      : defaultFilePath;

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Falta MONGODB_URI o MONGO_URI en .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Mongo conectado");

    const csvContent = fs.readFileSync(filePath, "utf-8");
    const rows = parseCSV(csvContent);

    let actualizados = 0;
    let sinCodigo = 0;
    let sinImagen = 0;
    let noEncontrados = 0;

    const reporteImagenes = [];

    for (const row of rows) {
      const codigo = normalizarCodigo(row.SKU);

      if (!codigo) {
        sinCodigo += 1;
        continue;
      }

      const imagenUrl = obtenerImagenUrl(row);

      if (!imagenUrl) {
        sinImagen += 1;
        continue;
      }

      const producto = await Producto.findOne({ codigo });

      if (!producto) {
        noEncontrados += 1;
        continue;
      }

      if (producto.imagenUrl === imagenUrl) {
        continue;
      }

      await Producto.updateOne({ _id: producto._id }, { $set: { imagenUrl } });

      actualizados += 1;
      reporteImagenes.push({
        codigo,
        nombre: producto.nombre,
        imagenUrl,
      });
    }

    fs.writeFileSync(
      path.resolve("src/seed/reporte-imagenes-actualizadas.json"),
      JSON.stringify(reporteImagenes, null, 2),
      "utf-8"
    );

    console.log("\n----- RESUMEN -----");
    console.log("Imagenes actualizadas:", actualizados);
    console.log("Filas sin codigo:", sinCodigo);
    console.log("Filas sin imagen:", sinImagen);
    console.log("Productos no encontrados:", noEncontrados);
    console.log("Reporte generado en src/seed/reporte-imagenes-actualizadas.json");

    await mongoose.disconnect();
    console.log("Mongo desconectado");
  } catch (error) {
    console.error("Error:", error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

run();
