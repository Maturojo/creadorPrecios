const ReglaPrefijo = require("../models/ReglaPrefijo");

async function clasificarProducto(codigo) {
  const codigoLimpio = String(codigo || "").toUpperCase().trim();

  let reglas = await ReglaPrefijo.find({ activo: true });

  reglas = reglas.sort((a, b) => b.prefijo.length - a.prefijo.length);

  const regla = reglas.find((r) => codigoLimpio.startsWith(r.prefijo));

  if (!regla) {
    return {
      familia: "SIN CLASIFICAR",
      subfamilia: "",
    };
  }

  return {
    familia: regla.familia,
    subfamilia: regla.subfamilia || "",
  };
}

module.exports = clasificarProducto;