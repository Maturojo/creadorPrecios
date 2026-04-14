import { apiFetch, PRODUCTOS_API_BASE_URL as API_URL } from "./api";

export async function obtenerProductos(params = {}) {
  const query = new URLSearchParams();

  if (params.categoria) query.set("categoria", params.categoria);
  if (params.subcategoria) query.set("subcategoria", params.subcategoria);
  if (params.q) query.set("q", params.q);

  const response = await apiFetch(`${API_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  return response.json();
}

export async function obtenerFiltrosProductos() {
  const response = await apiFetch(`${API_URL}/filtros`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los filtros");
  }

  return response.json();
}

export async function crearCategoriaOSubcategoria(data) {
  const response = await apiFetch(`${API_URL}/categorias`, {
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

export async function actualizarCategoria(nombreActual, data) {
  const response = await apiFetch(
    `${API_URL}/categorias/${encodeURIComponent(nombreActual)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo actualizar la categoria");
  }

  return response.json();
}

export async function actualizarSubcategoria(data) {
  const response = await apiFetch(`${API_URL}/subcategorias`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la subcategoria");
  }

  return response.json();
}

export async function actualizarClasificacionMultiple(ids, data) {
  const response = await apiFetch(`${API_URL}/clasificacion-multiple`, {
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
  const response = await apiFetch(`${API_URL}/historial`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el historial");
  }

  return response.json();
}

export async function guardarAccionHistorial(data) {
  const response = await apiFetch(`${API_URL}/historial`, {
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
  const response = await apiFetch(`${API_URL}/historial`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo limpiar el historial");
  }

  return response.json();
}

export async function eliminarCategoria(nombre) {
  const response = await apiFetch(
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
  const response = await apiFetch(`${API_URL}/subcategorias`, {
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

export async function importarPreciosProductos(filas) {
  const response = await apiFetch(`${API_URL}/importar-precios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filas }),
  });

  if (!response.ok) {
    let errorMessage = "No se pudieron importar los precios";

    try {
      const data = await response.json();
      if (data?.error) {
        errorMessage = data.error;
      }
    } catch {
      if (response.status === 413) {
        errorMessage =
          "El archivo es demasiado grande para enviarlo en un solo bloque.";
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
