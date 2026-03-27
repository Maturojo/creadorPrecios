import { useEffect, useMemo, useState } from "react";
import {
  actualizarClasificacionMultiple,
  obtenerFiltrosProductos,
  obtenerProductos,
} from "../services/productos";
import { imprimirCarteles } from "../utils/imprimirCarteles";
import "../styles/productos.css";
import "../styles/carteles-print.css";
import "../styles/productos-header.css";

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

  const [editandoMultiple, setEditandoMultiple] = useState(false);
  const [categoriaMultiple, setCategoriaMultiple] = useState("");
  const [subcategoriaMultiple, setSubcategoriaMultiple] = useState("");
  const [guardandoMultiple, setGuardandoMultiple] = useState(false);

  const subcategoriasDisponibles = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return subcategoriasPorCategoria[categoriaSeleccionada] || [];
  }, [categoriaSeleccionada, subcategoriasPorCategoria]);

  const subcategoriasMultiplesDisponibles = useMemo(() => {
    if (!categoriaMultiple) return [];
    return subcategoriasPorCategoria[categoriaMultiple] || [];
  }, [categoriaMultiple, subcategoriasPorCategoria]);

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

  useEffect(() => {
    setSeleccionados((prev) =>
      prev.filter((sel) => productos.some((p) => p._id === sel._id))
    );
  }, [productos]);

  function handleCategoriaChange(e) {
    const nuevaCategoria = e.target.value;
    setCategoriaSeleccionada(nuevaCategoria);

    if (nuevaCategoria === "Sin clasificar") {
      setSubcategoriaSeleccionada("Sin subcategoría");
    } else {
      setSubcategoriaSeleccionada("");
    }
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

  function deseleccionarTodos() {
    setSeleccionados([]);
  }

  function toggleSeleccionTodos() {
    if (!productos.length) return;

    const todosSeleccionadosActual =
      productos.length > 0 &&
      productos.every((producto) =>
        seleccionados.some((sel) => sel._id === producto._id)
      );

    if (todosSeleccionadosActual) {
      setSeleccionados((prev) =>
        prev.filter((sel) => !productos.some((p) => p._id === sel._id))
      );
    } else {
      const mapa = new Map();

      seleccionados.forEach((item) => {
        mapa.set(item._id, item);
      });

      productos.forEach((item) => {
        mapa.set(item._id, item);
      });

      setSeleccionados(Array.from(mapa.values()));
    }
  }

  const todosSeleccionados =
    productos.length > 0 &&
    productos.every((producto) =>
      seleccionados.some((sel) => sel._id === producto._id)
    );

  function abrirEditorMultiple() {
    setEditandoMultiple(true);
    setCategoriaMultiple("");
    setSubcategoriaMultiple("");
  }

  function cancelarEdicionMultiple() {
    setEditandoMultiple(false);
    setCategoriaMultiple("");
    setSubcategoriaMultiple("");
  }

  async function guardarClasificacionMultiple() {
    if (!seleccionados.length) {
      alert("Seleccioná al menos un producto.");
      return;
    }

    try {
      setGuardandoMultiple(true);

      await actualizarClasificacionMultiple(
        seleccionados.map((producto) => producto._id),
        {
          categoria: categoriaMultiple,
          subcategoria: subcategoriaMultiple,
        }
      );

      await cargarFiltros();
      await cargarProductos();
      setSeleccionados([]);
      cancelarEdicionMultiple();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar la clasificación múltiple.");
    } finally {
      setGuardandoMultiple(false);
    }
  }

  async function quitarClasificacionMultiple() {
    if (!seleccionados.length) {
      alert("Seleccioná al menos un producto.");
      return;
    }

    try {
      setGuardandoMultiple(true);

      await actualizarClasificacionMultiple(
        seleccionados.map((producto) => producto._id),
        {
          categoria: "",
          subcategoria: "",
        }
      );

      await cargarFiltros();
      await cargarProductos();
      setSeleccionados([]);
      cancelarEdicionMultiple();
    } catch (err) {
      console.error(err);
      alert("No se pudo quitar la clasificación múltiple.");
    } finally {
      setGuardandoMultiple(false);
    }
  }

  return (
    <section className="productos-page">
      <div className="productos-header">
        <div>
          <h1>Productos</h1>
          <p>Ver, filtrar, clasificar manualmente e imprimir carteles.</p>
        </div>

        <div className="acciones-header">
          <button
            className="btn-secundario"
            onClick={toggleSeleccionTodos}
            disabled={!productos.length}
          >
            {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
          </button>

          <button
            className="btn-secundario"
            onClick={deseleccionarTodos}
            disabled={!seleccionados.length}
          >
            Limpiar selección
          </button>

          <button
            className="btn-secundario"
            onClick={abrirEditorMultiple}
            disabled={!seleccionados.length}
          >
            Editar clasificación ({seleccionados.length})
          </button>

          <button
            className="btn-imprimir"
            onClick={() => imprimirCarteles(seleccionados)}
            disabled={!seleccionados.length}
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

        <select value={categoriaSeleccionada} onChange={handleCategoriaChange}>
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

      {editandoMultiple && (
        <div className="editor-multiple">
          <h3>Editar clasificación de seleccionados</h3>

          <div className="editor-multiple-filtros">
            <select
              value={categoriaMultiple}
              onChange={(e) => {
                setCategoriaMultiple(e.target.value);
                setSubcategoriaMultiple("");
              }}
            >
              <option value="">Sin clasificar</option>
              {categorias
                .filter((cat) => cat !== "Sin clasificar")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>

            <select
              value={subcategoriaMultiple}
              onChange={(e) => setSubcategoriaMultiple(e.target.value)}
              disabled={!categoriaMultiple}
            >
              <option value="">Sin subcategoría</option>
              {subcategoriasMultiplesDisponibles
                .filter((sub) => sub !== "Sin subcategoría")
                .map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          <div className="acciones-edicion">
            <button
              className="btn-secundario"
              onClick={guardarClasificacionMultiple}
              disabled={guardandoMultiple}
            >
              Guardar clasificación
            </button>

            <button
              className="btn-secundario"
              onClick={quitarClasificacionMultiple}
              disabled={guardandoMultiple}
            >
              Quitar clasificación
            </button>

            <button
              className="btn-secundario"
              onClick={cancelarEdicionMultiple}
              disabled={guardandoMultiple}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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