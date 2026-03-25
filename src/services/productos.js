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