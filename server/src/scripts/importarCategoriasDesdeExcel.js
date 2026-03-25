require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Producto = require("../../models/Producto.js");

const filePath = path.resolve("src/seed/productosCategorias.csv");

function limpiar(texto) {
  return String(texto || "").trim();
}

function normalizarCodigo(valor) {
  return limpiar(valor).toUpperCase();
}

function obtenerCategoriaYSub(categoriasRaw) {
  const texto = limpiar(categoriasRaw);

  if (!texto) {
    return { categoria: "", subcategoria: "", motivo: "sin-categorias" };
  }

  // Caso 1: "Artística, Artística > Pinturas"
  if (texto.includes(",")) {
    const partes = texto
      .split(",")
      .map((p) => limpiar(p))
      .filter(Boolean);

    const jerarquiaConFlecha = partes.find((p) => p.includes(">"));

    if (jerarquiaConFlecha) {
      const niveles = jerarquiaConFlecha
        .split(">")
        .map((p) => limpiar(p))
        .filter(Boolean);

      return {
        categoria: niveles[0] || "",
        subcategoria: niveles[1] || "",
        motivo: "ok-coma-jerarquia",
      };
    }

    return {
      categoria: partes[0] || "",
      subcategoria: partes[1] || "",
      motivo: "ok-coma-simple",
    };
  }

  // Caso 2: "Artística > Pinturas"
  if (texto.includes(">")) {
    const niveles = texto
      .split(">")
      .map((p) => limpiar(p))
      .filter(Boolean);

    return {
      categoria: niveles[0] || "",
      subcategoria: niveles[1] || "",
      motivo: "ok-jerarquia",
    };
  }

  // Caso 3: solo una categoría
  return {
    categoria: texto,
    subcategoria: "",
    motivo: "ok-sola-categoria",
  };
}

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Falta MONGODB_URI o MONGO_URI en .env");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Mongo conectado");

    const workbook = xlsx.readFile(filePath, { type: "file" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    let actualizados = 0;
    let noEncontrados = 0;
    let sinCodigo = 0;
    let sinCategoriaUtil = 0;

    const listaNoEncontrados = [];
    const listaSinCategoriaUtil = [];
    const listaActualizados = [];

    for (const row of rows) {
      const codigo = normalizarCodigo(row.SKU);

      if (!codigo) {
        sinCodigo++;
        continue;
      }

      const { categoria, subcategoria, motivo } = obtenerCategoriaYSub(
        row["Categorías"]
      );

      if (!categoria && !subcategoria) {
        sinCategoriaUtil++;
        listaSinCategoriaUtil.push({
          sku: codigo,
          categoriasRaw: row["Categorías"],
          motivo,
        });
        continue;
      }

      const producto = await Producto.findOne({ codigo });

      if (!producto) {
        noEncontrados++;
        listaNoEncontrados.push({
          sku: codigo,
          nombreCsv: limpiar(row.Nombre),
          categoriasRaw: row["Categorías"],
        });
        continue;
      }

      await Producto.updateOne(
        { _id: producto._id },
        {
          $set: {
            categoria: categoria || "",
            subcategoria: subcategoria || "",
          },
        }
      );

      actualizados++;
      listaActualizados.push({
        sku: codigo,
        nombre: producto.nombre,
        categoria,
        subcategoria,
      });

      console.log(`✅ ${codigo} -> ${categoria} / ${subcategoria}`);
    }

    fs.writeFileSync(
      path.resolve("src/seed/reporte-no-encontrados.json"),
      JSON.stringify(listaNoEncontrados, null, 2),
      "utf-8"
    );

    fs.writeFileSync(
      path.resolve("src/seed/reporte-sin-categoria-util.json"),
      JSON.stringify(listaSinCategoriaUtil, null, 2),
      "utf-8"
    );

    fs.writeFileSync(
      path.resolve("src/seed/reporte-actualizados.json"),
      JSON.stringify(listaActualizados, null, 2),
      "utf-8"
    );

    console.log("\n----- RESUMEN -----");
    console.log("Actualizados:", actualizados);
    console.log("No encontrados:", noEncontrados);
    console.log("Sin código:", sinCodigo);
    console.log("Sin categoría útil:", sinCategoriaUtil);
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