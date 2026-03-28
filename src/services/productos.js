const API_URL = (
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:4000/api/productos" : "/api/productos")
).replace(/\/$/, "");

export async function obtenerProductos(params = {}) {
  const query = new URLSearchParams();

  if (params.categoria) query.set("categoria", params.categoria);
  if (params.subcategoria) query.set("subcategoria", params.subcategoria);
  if (params.q) query.set("q", params.q);

  const response = await fetch(`${API_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  return response.json();
}

export async function obtenerFiltrosProductos() {
  const response = await fetch(`${API_URL}/filtros`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los filtros");
  }

  return response.json();
}

export async function crearCategoriaOSubcategoria(data) {
  const response = await fetch(`${API_URL}/categorias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la categoria o subcategoria");
  }

  return response.json();
}

export async function actualizarClasificacionMultiple(ids, data) {
  const response = await fetch(`${API_URL}/clasificacion-multiple`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids,
      ...data,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la clasificacion multiple");
  }

  return response.json();
}

export async function obtenerHistorialProductos() {
  const response = await fetch(`${API_URL}/historial`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el historial");
  }

  return response.json();
}

export async function guardarAccionHistorial(data) {
  const response = await fetch(`${API_URL}/historial`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar la accion en el historial");
  }

  return response.json();
}

export async function limpiarHistorialProductos() {
  const response = await fetch(`${API_URL}/historial`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo limpiar el historial");
  }

  return response.json();
}

export async function eliminarCategoria(nombre) {
  const response = await fetch(
    `${API_URL}/categorias/${encodeURIComponent(nombre)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo eliminar la categoria");
  }

  return response.json();
}

export async function eliminarSubcategoria(categoria, subcategoria) {
  const response = await fetch(`${API_URL}/subcategorias`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ categoria, subcategoria }),
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la subcategoria");
  }

  return response.json();
}
