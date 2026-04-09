const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${API_BASE_URL}/api/productos`;
const AUTH_KEY = "sm_auth";

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
    return auth?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || fallbackMessage);
  }
  return data;
}

export async function obtenerProductos(params = {}) {
  const query = new URLSearchParams();

  if (params.categoria) query.set("categoria", params.categoria);
  if (params.subcategoria) query.set("subcategoria", params.subcategoria);
  if (params.q) query.set("q", params.q);

  const response = await fetch(`${API_URL}?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  return parseResponse(response, "No se pudieron obtener los productos");
}

export async function obtenerFiltrosProductos() {
  const response = await fetch(`${API_URL}/filtros`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  return parseResponse(response, "No se pudieron obtener los filtros");
}

export async function crearCategoriaOSubcategoria(data) {
  const response = await fetch(`${API_URL}/categorias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response, "No se pudo crear la categoria o subcategoria");
}

export async function actualizarClasificacionProducto(id, data) {
  const response = await fetch(`${API_URL}/${id}/clasificacion`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response, "No se pudo actualizar la clasificacion");
}

export async function actualizarClasificacionMultiple(ids, data) {
  const response = await fetch(`${API_URL}/clasificacion-multiple`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      ids,
      ...data,
    }),
  });

  return parseResponse(response, "No se pudo actualizar la clasificacion multiple");
}

export async function obtenerHistorialProductos() {
  const response = await fetch(`${API_URL}/historial`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  return parseResponse(response, "No se pudo obtener el historial");
}

export async function guardarAccionHistorial(data) {
  const response = await fetch(`${API_URL}/historial`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response, "No se pudo guardar la accion en el historial");
}

export async function limpiarHistorialProductos() {
  const response = await fetch(`${API_URL}/historial`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response, "No se pudo limpiar el historial");
}

export async function eliminarCategoria(nombre) {
  const response = await fetch(`${API_URL}/categorias/${encodeURIComponent(nombre)}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response, "No se pudo eliminar la categoria");
}

export async function eliminarSubcategoria(categoria, subcategoria) {
  const response = await fetch(`${API_URL}/subcategorias`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ categoria, subcategoria }),
  });

  return parseResponse(response, "No se pudo eliminar la subcategoria");
}
