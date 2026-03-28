require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Producto = require("../../models/Producto");

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

  if (texto.includes(".") && texto.includes(",")) {
    const numero = Number(texto.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? Math.floor(numero) : null;
  }

  if (texto.includes(",") && !texto.includes(".")) {
    const numero = Number(texto.replace(",", "."));
    return Number.isFinite(numero) ? Math.floor(numero) : null;
  }

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
    .map((parte) => limpiar(parte))
    .filter(Boolean);

  const jerarquia = partes.find((parte) => parte.includes(">"));

  if (jerarquia) {
    const niveles = jerarquia
      .split(">")
      .map((parte) => limpiar(parte))
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

function normalizarHeader(header) {
  return limpiar(header)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function esUrlValida(valor) {
  const texto = limpiar(valor);
  return /^https?:\/\//i.test(texto);
}

function obtenerImagenUrl(row) {
  const entry = Object.entries(row).find(([header, value]) => {
    const normalizado = normalizarHeader(header);

    const pareceColumnaImagen =
      normalizado.includes("imagen") ||
      normalizado.includes("foto") ||
      (normalizado.includes("link") && normalizado.includes("imagen")) ||
      (normalizado.includes("url") && normalizado.includes("imagen")) ||
      (normalizado.includes("link") && normalizado.includes("foto")) ||
      (normalizado.includes("url") && normalizado.includes("foto"));

    return pareceColumnaImagen && esUrlValida(value);
  });

  return entry ? limpiar(entry[1]) : "";
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
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Falta MONGODB_URI o MONGO_URI en .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Mongo conectado");

    const csvContent = fs.readFileSync(filePath, "utf-8");
    const rows = parseCSV(csvContent);

    let actualizados = 0;
    let creados = 0;
    let sinCodigo = 0;
    let sinPrecio = 0;

    const reporteActualizados = [];
    const reporteCreados = [];

    for (const row of rows) {
      const codigo = normalizarCodigo(row.SKU);

      if (!codigo) {
        sinCodigo += 1;
        continue;
      }

      const nombre = limpiar(row.Nombre);
      const precioOriginal = row["Precio normal"];
      const precio = parsearPrecio(precioOriginal);
      const imagenUrl = obtenerImagenUrl(row);
      const { categoria, subcategoria } = obtenerCategoriaYSub(
        row["Categorías"] || row["CategorÃ­as"]
      );

      const producto = await Producto.findOne({ codigo });

      if (producto) {
        if (precio === null) {
          sinPrecio += 1;
          continue;
        }

        const update = { precio };

        if (imagenUrl) {
          update.imagenUrl = imagenUrl;
        }

        await Producto.updateOne({ _id: producto._id }, { $set: update });

        actualizados += 1;
        reporteActualizados.push({
          codigo,
          nombre: producto.nombre,
          precioAnterior: producto.precio,
          precioNuevo: precio,
          imagenUrl: imagenUrl || producto.imagenUrl || "",
        });

        continue;
      }

      const nuevoProducto = {
        codigo,
        nombre: nombre || codigo,
        precio: precio ?? 0,
        categoria,
        subcategoria,
        imagenUrl,
        activo: true,
      };

      await Producto.create(nuevoProducto);

      creados += 1;
      reporteCreados.push({
        codigo,
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        categoria: nuevoProducto.categoria,
        subcategoria: nuevoProducto.subcategoria,
        imagenUrl: nuevoProducto.imagenUrl,
      });
    }

    fs.writeFileSync(
      path.resolve("src/seed/reporte-actualizados.json"),
      JSON.stringify(reporteActualizados, null, 2),
      "utf-8"
    );

    fs.writeFileSync(
      path.resolve("src/seed/reporte-creados.json"),
      JSON.stringify(reporteCreados, null, 2),
      "utf-8"
    );

    console.log("\n----- RESUMEN -----");
    console.log("Actualizados:", actualizados);
    console.log("Creados:", creados);
    console.log("Sin codigo:", sinCodigo);
    console.log("Sin precio para actualizar:", sinPrecio);
    console.log("Reportes generados en src/seed");

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
