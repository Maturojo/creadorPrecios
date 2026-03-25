const mongoose = require("mongoose");

const ReglaPrefijo = require("../models/ReglaPrefijo");

async function clasificarProducto(codigo, productoId = null) {
  const codigoLimpio = String(codigo || "").toUpperCase().trim();

  let reglas = await ReglaPrefijo.find({ activo: true });
  reglas = reglas.sort((a, b) => b.prefijo.length - a.prefijo.length);

  for (const regla of reglas) {
    const coincidePrefijo = codigoLimpio.startsWith(
      String(regla.prefijo || "").toUpperCase().trim()
    );

    const incluidoManualmente =
      productoId &&
      Array.isArray(regla.productosIncluidos) &&
      regla.productosIncluidos.some((id) => String(id) === String(productoId));

    const excluidoManualmente =
      productoId &&
      Array.isArray(regla.productosExcluidos) &&
      regla.productosExcluidos.some((id) => String(id) === String(productoId));

    if ((coincidePrefijo || incluidoManualmente) && !excluidoManualmente) {
      return {
        familia: regla.familia,
        subfamilia: regla.subfamilia || "",
      };
    }
  }

  return {
    familia: "SIN CLASIFICAR",
    subfamilia: "",
  };
}

module.exports = clasificarProducto;