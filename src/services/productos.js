const API_URL = "http://localhost:4000/api/productos";

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

export async function actualizarClasificacionProducto(id, data) {
  const response = await fetch(`${API_URL}/${id}/clasificacion`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la clasificación");
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
    throw new Error("No se pudo actualizar la clasificación múltiple");
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
    throw new Error("No se pudo guardar la acción en el historial");
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