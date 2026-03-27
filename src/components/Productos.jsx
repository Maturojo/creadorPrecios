import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  actualizarClasificacionMultiple,
  obtenerFiltrosProductos,
  obtenerProductos,
} from "../services/productos";
import { imprimirCarteles } from "../utils/imprimirCarteles";
import "../styles/productos.css";
import "../styles/carteles-print.css";
import "../styles/productos-header.css";

const HISTORIAL_KEY = "historial-clasificaciones-productos";
const UMBRAL_CONFIRMACION_MASIVA = 20;

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

  const [mostrandoEditorCategorias, setMostrandoEditorCategorias] =
    useState(false);
  const [categoriaBaseNuevaSub, setCategoriaBaseNuevaSub] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");
  const [errorNuevaClasificacion, setErrorNuevaClasificacion] = useState("");

  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);
  const [historialAcciones, setHistorialAcciones] = useState([]);

  const subcategoriasDisponibles = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return subcategoriasPorCategoria[categoriaSeleccionada] || [];
  }, [categoriaSeleccionada, subcategoriasPorCategoria]);

  const subcategoriasMultiplesDisponibles = useMemo(() => {
    if (!categoriaMultiple) return [];
    return subcategoriasPorCategoria[categoriaMultiple] || [];
  }, [categoriaMultiple, subcategoriasPorCategoria]);

  async function confirmar({ titulo, texto, icon = "warning" }) {
    const result = await Swal.fire({
      title: titulo,
      text: texto,
      icon,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  }

  async function confirmarAccionMasiva(cantidad, textoAccion) {
    if (cantidad < UMBRAL_CONFIRMACION_MASIVA) return true;

    return confirmar({
      titulo: "Acción masiva",
      texto: `Vas a ${textoAccion} ${cantidad} productos. ¿Continuar?`,
    });
  }

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
      toast.error("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarFiltros().catch((err) => {
      console.error(err);
      toast.error("No se pudieron cargar los filtros.");
    });
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [categoriaSeleccionada, subcategoriaSeleccionada, busqueda]);

  useEffect(() => {
    setSeleccionados((prev) =>
      prev.filter((sel) => productos.some((p) => p._id === sel._id))
    );
  }, [productos]);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(HISTORIAL_KEY);
      if (guardado) {
        setHistorialAcciones(JSON.parse(guardado));
      }
    } catch (err) {
      console.error("No se pudo cargar el historial:", err);
    }
  }, []);

  function guardarEnHistorial(accion) {
    const nuevoRegistro = {
      id: Date.now() + Math.random(),
      fecha: new Date().toISOString(),
      ...accion,
    };

    setHistorialAcciones((prev) => {
      const actualizado = [nuevoRegistro, ...prev].slice(0, 100);
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(actualizado));
      return actualizado;
    });
  }

  async function limpiarHistorial() {
    const ok = await confirmar({
      titulo: "¿Limpiar historial?",
      texto: "Se eliminarán todas las acciones registradas.",
    });

    if (!ok) return;

    localStorage.removeItem(HISTORIAL_KEY);
    setHistorialAcciones([]);
    toast.success("Historial limpiado correctamente.");
  }

  function formatearFechaHistorial(fechaISO) {
    return new Date(fechaISO).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function normalizarTexto(texto) {
    return texto.trim().replace(/\s+/g, " ");
  }

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
      toast.warn("Seleccioná al menos un producto.");
      return;
    }

    const categoriaTexto = categoriaMultiple || "Sin clasificar";
    const subcategoriaTexto = subcategoriaMultiple || "Sin subcategoría";

    const ok = await confirmarAccionMasiva(
      seleccionados.length,
      "actualizar la clasificación de"
    );

    if (!ok) return;

    try {
      setGuardandoMultiple(true);

      await actualizarClasificacionMultiple(
        seleccionados.map((producto) => producto._id),
        {
          categoria: categoriaMultiple,
          subcategoria: subcategoriaMultiple,
        }
      );

      guardarEnHistorial({
        tipo: "clasificacion-multiple",
        descripcion: `Se actualizaron ${seleccionados.length} productos a ${categoriaTexto} > ${subcategoriaTexto}`,
        cantidad: seleccionados.length,
        categoria: categoriaTexto,
        subcategoria: subcategoriaTexto,
      });

      await cargarFiltros();
      await cargarProductos();
      setSeleccionados([]);
      cancelarEdicionMultiple();

      toast.success("Clasificación actualizada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la clasificación múltiple.");
    } finally {
      setGuardandoMultiple(false);
    }
  }

  async function quitarClasificacionMultiple() {
    if (!seleccionados.length) {
      toast.warn("Seleccioná al menos un producto.");
      return;
    }

    const ok = await confirmarAccionMasiva(
      seleccionados.length,
      "quitar la clasificación de"
    );

    if (!ok) return;

    try {
      setGuardandoMultiple(true);

      await actualizarClasificacionMultiple(
        seleccionados.map((producto) => producto._id),
        {
          categoria: "",
          subcategoria: "",
        }
      );

      guardarEnHistorial({
        tipo: "quitar-clasificacion-multiple",
        descripcion: `Se quitó la clasificación de ${seleccionados.length} productos`,
        cantidad: seleccionados.length,
        categoria: "Sin clasificar",
        subcategoria: "Sin subcategoría",
      });

      await cargarFiltros();
      await cargarProductos();
      setSeleccionados([]);
      cancelarEdicionMultiple();

      toast.success("Clasificación eliminada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo quitar la clasificación múltiple.");
    } finally {
      setGuardandoMultiple(false);
    }
  }

  function abrirEditorCategorias() {
    setMostrandoEditorCategorias(true);
    setCategoriaBaseNuevaSub("");
    setNuevaCategoria("");
    setNuevaSubcategoria("");
    setErrorNuevaClasificacion("");
  }

  function cancelarEditorCategorias() {
    setMostrandoEditorCategorias(false);
    setCategoriaBaseNuevaSub("");
    setNuevaCategoria("");
    setNuevaSubcategoria("");
    setErrorNuevaClasificacion("");
  }

  function existeCategoria(nombre) {
    return categorias.some(
      (cat) => cat.toLowerCase() === nombre.trim().toLowerCase()
    );
  }

  function existeSubcategoriaEnCategoria(categoria, subcategoria) {
    const lista = subcategoriasPorCategoria[categoria] || [];
    return lista.some(
      (sub) => sub.toLowerCase() === subcategoria.trim().toLowerCase()
    );
  }

  function guardarNuevaCategoriaOSubcategoria() {
    const categoriaExistenteElegida = normalizarTexto(categoriaBaseNuevaSub);
    const categoriaNueva = normalizarTexto(nuevaCategoria);
    const subNueva = normalizarTexto(nuevaSubcategoria);

    const categoriaFinal = categoriaNueva || categoriaExistenteElegida;

    if (!categoriaFinal) {
      setErrorNuevaClasificacion("Tenés que elegir o escribir una categoría.");
      return;
    }

    if (
      categoriaFinal.toLowerCase() === "sin clasificar" ||
      subNueva.toLowerCase() === "sin subcategoría"
    ) {
      setErrorNuevaClasificacion("Ese nombre no se puede usar.");
      return;
    }

    if (categoriaNueva && existeCategoria(categoriaNueva)) {
      setErrorNuevaClasificacion("La categoría nueva ya existe.");
      return;
    }

    if (subNueva && existeSubcategoriaEnCategoria(categoriaFinal, subNueva)) {
      setErrorNuevaClasificacion(
        "Esa subcategoría ya existe en esa categoría."
      );
      return;
    }

    setCategorias((prev) => {
      const yaExiste = prev.some(
        (cat) => cat.toLowerCase() === categoriaFinal.toLowerCase()
      );

      if (yaExiste) return prev;

      return [...prev, categoriaFinal].sort((a, b) => a.localeCompare(b, "es"));
    });

    setSubcategoriasPorCategoria((prev) => {
      const actual = { ...prev };

      if (!actual[categoriaFinal]) {
        actual[categoriaFinal] = [];
      }

      if (
        subNueva &&
        !actual[categoriaFinal].some(
          (sub) => sub.toLowerCase() === subNueva.toLowerCase()
        )
      ) {
        actual[categoriaFinal] = [...actual[categoriaFinal], subNueva].sort(
          (a, b) => a.localeCompare(b, "es")
        );
      }

      return actual;
    });

    setCategoriaMultiple(categoriaFinal);
    setSubcategoriaMultiple(subNueva || "");

    guardarEnHistorial({
      tipo: "crear-categoria-subcategoria",
      descripcion: subNueva
        ? `Se creó ${categoriaFinal} > ${subNueva}`
        : `Se creó la categoría ${categoriaFinal}`,
      cantidad: 0,
      categoria: categoriaFinal,
      subcategoria: subNueva || "",
    });

    cancelarEditorCategorias();
    toast.success("Categoría / subcategoría guardada.");
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

          <button className="btn-secundario" onClick={abrirEditorCategorias}>
            Nueva categoría / subcategoría
          </button>

          <button
            className="btn-secundario"
            onClick={() => setMostrandoHistorial((prev) => !prev)}
          >
            {mostrandoHistorial ? "Ocultar historial" : "Ver historial"}
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

      {mostrandoHistorial && (
        <div className="editor-multiple">
          <div className="historial-header">
            <h3>Historial de acciones</h3>

            <button
              className="btn-secundario"
              onClick={limpiarHistorial}
              disabled={!historialAcciones.length}
            >
              Limpiar historial
            </button>
          </div>

          {!historialAcciones.length ? (
            <p className="estado">Todavía no hay acciones registradas.</p>
          ) : (
            <div className="historial-lista">
              {historialAcciones.map((item) => (
                <div key={item.id} className="historial-item">
                  <div className="historial-item-top">
                    <strong>{item.descripcion}</strong>
                  </div>
                  <div className="historial-item-meta">
                    <span>{formatearFechaHistorial(item.fecha)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mostrandoEditorCategorias && (
        <div className="editor-multiple">
          <h3>Agregar categoría o subcategoría</h3>

          <div className="editor-multiple-filtros">
            <select
              value={categoriaBaseNuevaSub}
              onChange={(e) => setCategoriaBaseNuevaSub(e.target.value)}
            >
              <option value="">Elegir categoría existente</option>
              {categorias
                .filter((cat) => cat !== "Sin clasificar")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="O escribir categoría nueva"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
            />

            <input
              type="text"
              placeholder="Subcategoría nueva (opcional)"
              value={nuevaSubcategoria}
              onChange={(e) => setNuevaSubcategoria(e.target.value)}
            />
          </div>

          {errorNuevaClasificacion && (
            <p className="estado error">{errorNuevaClasificacion}</p>
          )}

          <div className="acciones-edicion">
            <button
              className="btn-secundario"
              onClick={guardarNuevaCategoriaOSubcategoria}
            >
              Guardar
            </button>

            <button
              className="btn-secundario"
              onClick={cancelarEditorCategorias}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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