const COLUMNAS_EXPORTACION = [
  "ID",
  "Tipo",
  "SKU",
  "GTIN, UPC, EAN o ISBN",
  "Nombre",
  "Publicado",
  "¿Está destacado?",
  "Visibilidad en el catálogo",
  "Descripción corta",
  "Descripción",
  "Día en que empieza el precio rebajado",
  "Día en que termina el precio rebajado",
  "Estado del impuesto",
  "Clase de impuesto",
  "¿Existencias?",
  "Inventario",
  "Cantidad de bajo inventario",
  "¿Permitir reservas de productos agotados?",
  "¿Vendido individualmente?",
  "Peso (kg)",
  "Longitud (cm)",
  "Anchura (cm)",
  "Altura (cm)",
  "¿Permitir valoraciones de clientes?",
  "Nota de compra",
  "Precio rebajado",
  "Precio normal",
  "Categorías",
  "Etiquetas",
  "Clase de envío",
  "Imágenes",
  "Límite de descargas",
  "Días de caducidad de la descarga",
  "Superior",
  "Productos agrupados",
  "Ventas dirigidas",
  "Ventas cruzadas",
  "URL externa",
  "Texto del botón",
  "Posición",
  "Swatches Attributes",
  "Marcas",
  "Nombre del atributo 1",
  "Valor(es) del atributo 1",
  "Atributo visible 1",
  "Atributo global 1",
  "Atributo por defecto 1",
];

function normalizarCategoria(valor, fallback) {
  return (valor || "").trim() || fallback;
}

function armarCategorias(categoria, subcategoria) {
  const categoriaNormalizada = normalizarCategoria(categoria, "Sin clasificar");
  const subcategoriaNormalizada = normalizarCategoria(
    subcategoria,
    "Sin subcategoría"
  );

  if (subcategoriaNormalizada === "Sin subcategoría") {
    return categoriaNormalizada;
  }

  return `${categoriaNormalizada}, ${categoriaNormalizada} > ${subcategoriaNormalizada}`;
}

function escaparCsv(valor) {
  const texto = String(valor ?? "");

  if (texto.includes(",") || texto.includes('"') || texto.includes("\n")) {
    return `"${texto.replace(/"/g, '""')}"`;
  }

  return texto;
}

function crearFila(producto, index) {
  const categoria = normalizarCategoria(producto.categoria, "Sin clasificar");
  const subcategoria = normalizarCategoria(
    producto.subcategoria,
    "Sin subcategoría"
  );

  return [
    producto.id || producto._id || index + 1,
    "simple",
    producto.codigo || "",
    "",
    producto.nombre || "",
    1,
    0,
    "visible",
    "",
    "",
    "",
    "",
    "taxable",
    "",
    1,
    "",
    "",
    0,
    0,
    "",
    "",
    "",
    "",
    1,
    "",
    "",
    Number(producto.precio || 0),
    armarCategorias(categoria, subcategoria),
    "",
    "",
    producto.imagenUrl || "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    index,
    "",
    "",
    "Subcategoría",
    subcategoria,
    1,
    0,
    "",
  ];
}

export function exportarProductosCsv(productos) {
  const filas = [
    COLUMNAS_EXPORTACION,
    ...productos.map((producto, index) => crearFila(producto, index)),
  ];

  const csv = filas.map((fila) => fila.map(escaparCsv).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `productos-exportados-${fecha}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
