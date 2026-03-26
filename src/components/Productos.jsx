import { useEffect, useMemo, useState } from "react";
import {
  obtenerFiltrosProductos,
  obtenerProductos,
} from "../services/productos";
import { imprimirCarteles } from "../utils/imprimirCarteles";
import "../styles/productos.css";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategoriasPorCategoria, setSubcategoriasPorCategoria] = useState(
    {}
  );

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subcategoriasDisponibles = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return subcategoriasPorCategoria[categoriaSeleccionada] || [];
  }, [categoriaSeleccionada, subcategoriasPorCategoria]);

  async function cargarFiltros() {
    const data = await obtenerFiltrosProductos();
    setCategorias(data.categorias || []);
    setSubcategoriasPorCategoria(data.subcategorias || {});
  }

  async function cargarProductos() {
    setLoading(true);
    setError("");

    try {
      const data = await obtenerProductos({
        categoria: categoriaSeleccionada,
        subcategoria: subcategoriaSeleccionada,
        q: busqueda,
      });

      setProductos(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarFiltros();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [categoriaSeleccionada, subcategoriaSeleccionada, busqueda]);

  function handleCategoriaChange(e) {
    setCategoriaSeleccionada(e.target.value);
    setSubcategoriaSeleccionada("");
  }

  function toggleSeleccion(producto) {
    setSeleccionados((prev) => {
      const existe = prev.some((p) => p._id === producto._id);

      if (existe) {
        return prev.filter((p) => p._id !== producto._id);
      }

      return [...prev, producto];
    });
  }

  function estaSeleccionado(id) {
    return seleccionados.some((p) => p._id === id);
  }

  function seleccionarTodosVisibles() {
  setSeleccionados((prev) => {
    const idsPrevios = new Set(prev.map((p) => p._id));
    const nuevos = productos.filter((p) => !idsPrevios.has(p._id));
    return [...prev, ...nuevos];
  });
}

function deseleccionarTodosVisibles() {
  const idsVisibles = new Set(productos.map((p) => p._id));

  setSeleccionados((prev) =>
    prev.filter((p) => !idsVisibles.has(p._id))
  );
}

const todosVisiblesSeleccionados =
  productos.length > 0 &&
  productos.every((producto) => estaSeleccionado(producto._id));

  return (
    <section className="productos-page">
      <div className="productos-header">
        <div>
          <h1>Productos</h1>
          <p>Ver todos los productos, filtrarlos y generar carteles.</p>
        </div>

        <div className="productos-acciones">
          <button
            type="button"
            className="btn-secundario"
            onClick={seleccionarTodosVisibles}
            disabled={!productos.length || todosVisiblesSeleccionados}
          >
            Seleccionar todos
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={deseleccionarTodosVisibles}
            disabled={!productos.length}
          >
            Deseleccionar todos
          </button>

          <button
            className="btn-imprimir"
            onClick={() => imprimirCarteles(seleccionados)}
          >
            Imprimir carteles ({seleccionados.length})
          </button>
        </div>
      </div>

      <div className="productos-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          value={categoriaSeleccionada}
          onChange={handleCategoriaChange}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={subcategoriaSeleccionada}
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
          disabled={!categoriaSeleccionada}
        >
          <option value="">Todas las subcategorías</option>
          {subcategoriasDisponibles.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="estado">Cargando productos...</p>}
      {error && <p className="estado error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="productos-resumen">
            <strong>{productos.length}</strong> productos encontrados
          </div>

          <div className="productos-grid">
            {productos.map((producto) => (
              <article
                className={`producto-card ${
                  estaSeleccionado(producto._id) ? "seleccionado" : ""
                }`}
                key={producto._id}
              >
                <label className="producto-check">
                  <input
                    type="checkbox"
                    checked={estaSeleccionado(producto._id)}
                    onChange={() => toggleSeleccion(producto)}
                  />
                  Seleccionar
                </label>

                <div className="producto-card-top">
                  <span className="producto-codigo">{producto.codigo}</span>
                  <span className="producto-precio">
                    ${Number(producto.precio || 0).toLocaleString("es-AR")}
                  </span>
                </div>

                <h3>{producto.nombre}</h3>

                <div className="producto-tags">
                  <span>{producto.categoria}</span>
                  <span>{producto.subcategoria}</span>
                </div>
              </article>
            ))}
          </div>

          {!productos.length && (
            <p className="estado">No hay productos para esos filtros.</p>
          )}
        </>
      )}
    </section>
  );
}