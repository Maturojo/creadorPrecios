import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  actualizarClasificacionMultiple,
  crearCategoriaOSubcategoria,
  eliminarCategoria,
  eliminarSubcategoria,
  guardarAccionHistorial,
  limpiarHistorialProductos,
  obtenerFiltrosProductos,
  obtenerHistorialProductos,
  obtenerProductos,
} from "../services/productos";
import { exportarProductosCsv } from "../utils/exportarProductosCsv";
import { imprimirCarteles } from "../utils/imprimirCartelesEditable";
import EdicionMultiplePanel from "./productos/EdicionMultiplePanel";
import EditorCategoriasPanel from "./productos/EditorCategoriasPanel";
import EliminarClasificacionPanel from "./productos/EliminarClasificacionPanel";
import HistorialPanel from "./productos/HistorialPanel";
import ProductosFiltros from "./productos/ProductosFiltros";
import ProductosGrid from "./productos/ProductosGrid";
import ProductosHeader from "./productos/ProductosHeader";
import "../styles/productos.css";
import "../styles/carteles-print.css";
import "../styles/productos-header.css";
import "../styles/producto-card.css";

const PRODUCTOS_POR_PAGINA = 24;

const UMBRAL_CONFIRMACION_MASIVA = 20;
const SIN_CLASIFICAR = "Sin clasificar";
const SIN_SUBCATEGORIA = "Sin subcategoría";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategoriasPorCategoria, setSubcategoriasPorCategoria] = useState({});

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportandoProductos, setExportandoProductos] = useState(false);

  const [editandoMultiple, setEditandoMultiple] = useState(false);
  const [categoriaMultiple, setCategoriaMultiple] = useState("");
  const [subcategoriaMultiple, setSubcategoriaMultiple] = useState("");
  const [guardandoMultiple, setGuardandoMultiple] = useState(false);

  const [mostrandoEditorCategorias, setMostrandoEditorCategorias] = useState(false);
  const [categoriaBaseNuevaSub, setCategoriaBaseNuevaSub] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");
  const [errorNuevaClasificacion, setErrorNuevaClasificacion] = useState("");

  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);
  const [historialAcciones, setHistorialAcciones] = useState([]);

  const [mostrandoEliminar, setMostrandoEliminar] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState("");
  const [subcategoriaAEliminar, setSubcategoriaAEliminar] = useState("");
  const [eliminandoClasificacion, setEliminandoClasificacion] = useState(false);

  const [formatoImpresion, setFormatoImpresion] = useState("a4");
  const [modoAgrupacionImpresion, setModoAgrupacionImpresion] =
    useState("clasificacion");
  const [paginaActual, setPaginaActual] = useState(1);

  const subcategoriasDisponibles = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return subcategoriasPorCategoria[categoriaSeleccionada] || [];
  }, [categoriaSeleccionada, subcategoriasPorCategoria]);

  const subcategoriasMultiplesDisponibles = useMemo(() => {
    if (!categoriaMultiple) return [];
    return subcategoriasPorCategoria[categoriaMultiple] || [];
  }, [categoriaMultiple, subcategoriasPorCategoria]);

  const subcategoriasEliminarDisponibles = useMemo(() => {
    if (!categoriaAEliminar) return [];
    return subcategoriasPorCategoria[categoriaAEliminar] || [];
  }, [categoriaAEliminar, subcategoriasPorCategoria]);

  const seleccionadosIds = useMemo(
    () => new Set(seleccionados.map((producto) => producto._id)),
    [seleccionados]
  );

  const totalPaginas = useMemo(() => {
    if (!productos.length) return 1;
    return Math.ceil(productos.length / PRODUCTOS_POR_PAGINA);
  }, [productos.length]);

  const paginaActualSegura = Math.min(paginaActual, totalPaginas);

  const productosPaginados = useMemo(() => {
    const inicio = (paginaActualSegura - 1) * PRODUCTOS_POR_PAGINA;
    return productos.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
  }, [paginaActualSegura, productos]);

  const rangoProductos = useMemo(() => {
    if (!productos.length) {
      return { inicio: 0, fin: 0 };
    }

    const inicio = (paginaActualSegura - 1) * PRODUCTOS_POR_PAGINA + 1;
    const fin = Math.min(
      paginaActualSegura * PRODUCTOS_POR_PAGINA,
      productos.length
    );

    return { inicio, fin };
  }, [paginaActualSegura, productos.length]);

  const todosSeleccionados = useMemo(() => {
    return (
      productosPaginados.length > 0 &&
      productosPaginados.every((producto) => seleccionadosIds.has(producto._id))
    );
  }, [productosPaginados, seleccionadosIds]);

  const todosFiltradosSeleccionados = useMemo(() => {
    return (
      productos.length > 0 &&
      productos.every((producto) => seleccionadosIds.has(producto._id))
    );
  }, [productos, seleccionadosIds]);

  const seleccionadosPreview = useMemo(() => {
    return seleccionados.slice(0, 6);
  }, [seleccionados]);

  async function confirmar({ titulo, texto, icon = "warning" }) {
    const result = await Swal.fire({
      title: titulo,
      text: texto,
      icon,
      showCancelButton: true,
      confirmButtonText: "Si, continuar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  }

  async function confirmarAccionMasiva(cantidad, textoAccion) {
    if (cantidad < UMBRAL_CONFIRMACION_MASIVA) return true;

    return confirmar({
      titulo: "Accion masiva",
      texto: `Vas a ${textoAccion} ${cantidad} productos. Continuar?`,
    });
  }

  const cargarFiltros = useCallback(async () => {
    const data = await obtenerFiltrosProductos();
    setCategorias(data.categorias || []);
    setSubcategoriasPorCategoria(data.subcategorias || {});
  }, []);

  const cargarProductos = useCallback(async () => {
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
  }, [busqueda, categoriaSeleccionada, subcategoriaSeleccionada]);

  const cargarHistorial = useCallback(async () => {
    try {
      const data = await obtenerHistorialProductos();
      setHistorialAcciones(data || []);
    } catch (err) {
      console.error("No se pudo cargar el historial:", err);
      toast.error("No se pudo cargar el historial.");
    }
  }, []);

  useEffect(() => {
    cargarFiltros().catch((err) => {
      console.error(err);
      toast.error("No se pudieron cargar los filtros.");
    });

    cargarHistorial();
  }, [cargarFiltros, cargarHistorial]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaSeleccionada, subcategoriaSeleccionada]);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  useEffect(() => {
    setSeleccionados((prev) => {
      if (!prev.length || !productos.length) return prev;

      const productosPorId = new Map(
        productos.map((producto) => [producto._id, producto])
      );

      return prev.map((seleccionado) => {
        return productosPorId.get(seleccionado._id) || seleccionado;
      });
    });
  }, [productos]);

  async function guardarEnHistorial(accion) {
    try {
      const nuevoRegistro = await guardarAccionHistorial(accion);
      setHistorialAcciones((prev) => [nuevoRegistro, ...prev].slice(0, 100));
    } catch (err) {
      console.error("No se pudo guardar en historial:", err);
      toast.error("No se pudo guardar en el historial.");
    }
  }

  async function limpiarHistorial() {
    const ok = await confirmar({
      titulo: "Limpiar historial?",
      texto: "Se eliminaran todas las acciones registradas.",
    });

    if (!ok) return;

    try {
      await limpiarHistorialProductos();
      setHistorialAcciones([]);
      toast.success("Historial limpiado correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo limpiar el historial.");
    }
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

  function handleCategoriaChange(event) {
    const nuevaCategoria = event.target.value;
    setCategoriaSeleccionada(nuevaCategoria);
    setSubcategoriaSeleccionada(
      nuevaCategoria === SIN_CLASIFICAR ? SIN_SUBCATEGORIA : ""
    );
  }

  function toggleSeleccion(producto) {
    setSeleccionados((prev) => {
      const existe = prev.some((item) => item._id === producto._id);

      if (existe) {
        return prev.filter((item) => item._id !== producto._id);
      }

      return [...prev, producto];
    });
  }

  function deseleccionarTodos() {
    setSeleccionados([]);
  }

  function toggleSeleccionTodos() {
    if (!productosPaginados.length) return;

    if (todosSeleccionados) {
      setSeleccionados((prev) =>
        prev.filter(
          (sel) => !productosPaginados.some((producto) => producto._id === sel._id)
        )
      );
      return;
    }

    const mapa = new Map();

    seleccionados.forEach((item) => {
      mapa.set(item._id, item);
    });

    productosPaginados.forEach((item) => {
      mapa.set(item._id, item);
    });

    setSeleccionados(Array.from(mapa.values()));
  }

  function toggleSeleccionFiltrados() {
    if (!productos.length) return;

    if (todosFiltradosSeleccionados) {
      setSeleccionados((prev) =>
        prev.filter(
          (seleccionado) =>
            !productos.some((producto) => producto._id === seleccionado._id)
        )
      );
      return;
    }

    const mapa = new Map();

    seleccionados.forEach((item) => {
      mapa.set(item._id, item);
    });

    productos.forEach((item) => {
      mapa.set(item._id, item);
    });

    setSeleccionados(Array.from(mapa.values()));
  }

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
      toast.warn("Selecciona al menos un producto.");
      return;
    }

    const categoriaTexto = categoriaMultiple || SIN_CLASIFICAR;
    const subcategoriaTexto = subcategoriaMultiple || SIN_SUBCATEGORIA;

    const ok = await confirmarAccionMasiva(
      seleccionados.length,
      "actualizar la clasificacion de"
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

      await guardarEnHistorial({
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

      toast.success("Clasificacion actualizada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la clasificacion multiple.");
    } finally {
      setGuardandoMultiple(false);
    }
  }

  async function quitarClasificacionMultiple() {
    if (!seleccionados.length) {
      toast.warn("Selecciona al menos un producto.");
      return;
    }

    const ok = await confirmarAccionMasiva(
      seleccionados.length,
      "quitar la clasificacion de"
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

      await guardarEnHistorial({
        tipo: "quitar-clasificacion-multiple",
        descripcion: `Se quito la clasificacion de ${seleccionados.length} productos`,
        cantidad: seleccionados.length,
        categoria: SIN_CLASIFICAR,
        subcategoria: SIN_SUBCATEGORIA,
      });

      await cargarFiltros();
      await cargarProductos();
      setSeleccionados([]);
      cancelarEdicionMultiple();

      toast.success("Clasificacion eliminada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo quitar la clasificacion multiple.");
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
      (categoria) => categoria.toLowerCase() === nombre.trim().toLowerCase()
    );
  }

  function existeSubcategoriaEnCategoria(categoria, subcategoria) {
    const lista = subcategoriasPorCategoria[categoria] || [];
    return lista.some(
      (item) => item.toLowerCase() === subcategoria.trim().toLowerCase()
    );
  }

  async function guardarNuevaCategoriaOSubcategoria() {
    const categoriaExistenteElegida = normalizarTexto(categoriaBaseNuevaSub);
    const categoriaNueva = normalizarTexto(nuevaCategoria);
    const subNueva = normalizarTexto(nuevaSubcategoria);

    const categoriaFinal = categoriaNueva || categoriaExistenteElegida;

    if (!categoriaFinal) {
      setErrorNuevaClasificacion("Tienes que elegir o escribir una categoria.");
      return;
    }

    if (
      categoriaFinal.toLowerCase() === SIN_CLASIFICAR.toLowerCase() ||
      subNueva.toLowerCase() === SIN_SUBCATEGORIA.toLowerCase()
    ) {
      setErrorNuevaClasificacion("Ese nombre no se puede usar.");
      return;
    }

    if (categoriaNueva && existeCategoria(categoriaNueva)) {
      setErrorNuevaClasificacion("La categoria nueva ya existe.");
      return;
    }

    if (subNueva && existeSubcategoriaEnCategoria(categoriaFinal, subNueva)) {
      setErrorNuevaClasificacion(
        "Esa subcategoria ya existe en esa categoria."
      );
      return;
    }

    try {
      await crearCategoriaOSubcategoria({
        categoria: categoriaFinal,
        subcategoria: subNueva || "",
      });

      await cargarFiltros();

      setCategoriaMultiple(categoriaFinal);
      setSubcategoriaMultiple(subNueva || "");

      await guardarEnHistorial({
        tipo: "crear-categoria-subcategoria",
        descripcion: subNueva
          ? `Se creo ${categoriaFinal} > ${subNueva}`
          : `Se creo la categoria ${categoriaFinal}`,
        cantidad: 0,
        categoria: categoriaFinal,
        subcategoria: subNueva || "",
      });

      cancelarEditorCategorias();
      toast.success("Categoria / subcategoria guardada.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la categoria / subcategoria.");
    }
  }

  function abrirEliminarClasificacion() {
    setMostrandoEliminar(true);
    setCategoriaAEliminar("");
    setSubcategoriaAEliminar("");
  }

  function cancelarEliminarClasificacion() {
    setMostrandoEliminar(false);
    setCategoriaAEliminar("");
    setSubcategoriaAEliminar("");
  }

  async function eliminarCategoriaCompleta() {
    if (!categoriaAEliminar) {
      toast.warn("Selecciona una categoria.");
      return;
    }

    const ok = await confirmar({
      titulo: "Eliminar categoria?",
      texto: `Se eliminara la categoria "${categoriaAEliminar}", sus subcategorias y se limpiaran los productos asociados.`,
    });

    if (!ok) return;

    try {
      setEliminandoClasificacion(true);

      const resultado = await eliminarCategoria(categoriaAEliminar);

      await guardarEnHistorial({
        tipo: "eliminar-categoria",
        descripcion: `Se elimino la categoria ${categoriaAEliminar} y se limpiaron ${
          resultado.productosActualizados || 0
        } productos`,
        cantidad: resultado.productosActualizados || 0,
        categoria: categoriaAEliminar,
        subcategoria: "",
      });

      await cargarFiltros();
      await cargarProductos();

      if (categoriaSeleccionada === categoriaAEliminar) {
        setCategoriaSeleccionada("");
        setSubcategoriaSeleccionada("");
      }

      if (categoriaMultiple === categoriaAEliminar) {
        setCategoriaMultiple("");
        setSubcategoriaMultiple("");
      }

      cancelarEliminarClasificacion();
      toast.success("Categoria eliminada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la categoria.");
    } finally {
      setEliminandoClasificacion(false);
    }
  }

  async function eliminarSubcategoriaIndividual() {
    if (!categoriaAEliminar || !subcategoriaAEliminar) {
      toast.warn("Selecciona categoria y subcategoria.");
      return;
    }

    const ok = await confirmar({
      titulo: "Eliminar subcategoria?",
      texto: `Se eliminara la subcategoria "${subcategoriaAEliminar}" de "${categoriaAEliminar}" y se limpiaran los productos asociados.`,
    });

    if (!ok) return;

    try {
      setEliminandoClasificacion(true);

      const resultado = await eliminarSubcategoria(
        categoriaAEliminar,
        subcategoriaAEliminar
      );

      await guardarEnHistorial({
        tipo: "eliminar-subcategoria",
        descripcion: `Se elimino la subcategoria ${categoriaAEliminar} > ${subcategoriaAEliminar} y se limpiaron ${
          resultado.productosActualizados || 0
        } productos`,
        cantidad: resultado.productosActualizados || 0,
        categoria: categoriaAEliminar,
        subcategoria: subcategoriaAEliminar,
      });

      await cargarFiltros();
      await cargarProductos();

      if (
        categoriaSeleccionada === categoriaAEliminar &&
        subcategoriaSeleccionada === subcategoriaAEliminar
      ) {
        setSubcategoriaSeleccionada("");
      }

      if (
        categoriaMultiple === categoriaAEliminar &&
        subcategoriaMultiple === subcategoriaAEliminar
      ) {
        setSubcategoriaMultiple("");
      }

      cancelarEliminarClasificacion();
      toast.success("Subcategoria eliminada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la subcategoria.");
    } finally {
      setEliminandoClasificacion(false);
    }
  }

  function handleImprimir() {
    if (!seleccionados.length) {
      toast.warn("Selecciona al menos un producto para imprimir.");
      return;
    }

    imprimirCarteles(seleccionados, {
      formato: formatoImpresion,
      agrupacion: modoAgrupacionImpresion,
    });
  }

  async function handleExportarProductos() {
    try {
      setExportandoProductos(true);
      const todosLosProductos = await obtenerProductos();

      if (!todosLosProductos.length) {
        toast.warn("No hay productos para exportar.");
        return;
      }

      exportarProductosCsv(todosLosProductos);
      toast.success(
        `Se exportaron ${todosLosProductos.length} productos en CSV.`
      );
    } catch (err) {
      console.error(err);
      toast.error("No se pudo exportar el CSV de productos.");
    } finally {
      setExportandoProductos(false);
    }
  }

  return (
    <section className="productos-page">
      <ProductosHeader
        productosCount={productosPaginados.length}
        totalFiltradosCount={productos.length}
        seleccionadosCount={seleccionados.length}
        todosSeleccionados={todosSeleccionados}
        todosFiltradosSeleccionados={todosFiltradosSeleccionados}
        mostrandoHistorial={mostrandoHistorial}
        formatoImpresion={formatoImpresion}
        modoAgrupacionImpresion={modoAgrupacionImpresion}
        exportandoProductos={exportandoProductos}
        onToggleSeleccionTodos={toggleSeleccionTodos}
        onToggleSeleccionFiltrados={toggleSeleccionFiltrados}
        onDeseleccionarTodos={deseleccionarTodos}
        onAbrirEditorMultiple={abrirEditorMultiple}
        onAbrirEditorCategorias={abrirEditorCategorias}
        onAbrirEliminarClasificacion={abrirEliminarClasificacion}
        onExportarProductos={handleExportarProductos}
        onToggleHistorial={() => setMostrandoHistorial((prev) => !prev)}
        onFormatoImpresionChange={setFormatoImpresion}
        onModoAgrupacionImpresionChange={setModoAgrupacionImpresion}
        onImprimir={handleImprimir}
      />

      <ProductosFiltros
        busqueda={busqueda}
        categoriaSeleccionada={categoriaSeleccionada}
        subcategoriaSeleccionada={subcategoriaSeleccionada}
        categorias={categorias}
        subcategoriasDisponibles={subcategoriasDisponibles}
        onBusquedaChange={setBusqueda}
        onCategoriaChange={handleCategoriaChange}
        onSubcategoriaChange={setSubcategoriaSeleccionada}
      />

      {seleccionados.length ? (
        <section className="seleccion-resumen">
          <div className="seleccion-resumen-copy">
            <strong>{seleccionados.length} productos seleccionados</strong>
            <span>
              La seleccion se mantiene aunque cambies categoria, subcategoria o
              busqueda.
            </span>
          </div>

          <div className="seleccion-resumen-tags">
            {seleccionadosPreview.map((producto) => (
              <button
                key={producto._id}
                type="button"
                className="seleccion-tag"
                onClick={() => toggleSeleccion(producto)}
                title="Quitar de la seleccion"
              >
                <span>{producto.codigo}</span>
                <strong>{producto.nombre}</strong>
              </button>
            ))}

            {seleccionados.length > seleccionadosPreview.length ? (
              <span className="seleccion-tag seleccion-tag--ghost">
                +{seleccionados.length - seleccionadosPreview.length} mas
              </span>
            ) : null}
          </div>

          <div className="seleccion-panel">
            <div className="seleccion-panel-header">
              <strong>Seleccion completa</strong>
              <span>
                Revisa la tanda antes de imprimir o cambiar clasificaciones.
              </span>
            </div>

            <div className="seleccion-panel-lista">
              {seleccionados.map((producto) => (
                <article key={producto._id} className="seleccion-panel-item">
                  <div className="seleccion-panel-item-copy">
                    <strong>{producto.nombre}</strong>
                    <span>
                      {producto.codigo} · {producto.categoria} ·{" "}
                      {producto.subcategoria}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-text btn-text-danger"
                    onClick={() => toggleSeleccion(producto)}
                  >
                    Quitar
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {mostrandoEliminar ? (
        <EliminarClasificacionPanel
          categorias={categorias}
          categoriaAEliminar={categoriaAEliminar}
          subcategoriaAEliminar={subcategoriaAEliminar}
          subcategoriasEliminarDisponibles={subcategoriasEliminarDisponibles}
          eliminandoClasificacion={eliminandoClasificacion}
          onCategoriaChange={(event) => {
            setCategoriaAEliminar(event.target.value);
            setSubcategoriaAEliminar("");
          }}
          onSubcategoriaChange={setSubcategoriaAEliminar}
          onEliminarCategoriaCompleta={eliminarCategoriaCompleta}
          onEliminarSubcategoriaIndividual={eliminarSubcategoriaIndividual}
          onCancelar={cancelarEliminarClasificacion}
        />
      ) : null}

      {mostrandoHistorial ? (
        <HistorialPanel
          historialAcciones={historialAcciones}
          onLimpiarHistorial={limpiarHistorial}
          formatearFechaHistorial={formatearFechaHistorial}
        />
      ) : null}

      {mostrandoEditorCategorias ? (
        <EditorCategoriasPanel
          categorias={categorias}
          categoriaBaseNuevaSub={categoriaBaseNuevaSub}
          nuevaCategoria={nuevaCategoria}
          nuevaSubcategoria={nuevaSubcategoria}
          errorNuevaClasificacion={errorNuevaClasificacion}
          onCategoriaBaseChange={setCategoriaBaseNuevaSub}
          onNuevaCategoriaChange={setNuevaCategoria}
          onNuevaSubcategoriaChange={setNuevaSubcategoria}
          onGuardar={guardarNuevaCategoriaOSubcategoria}
          onCancelar={cancelarEditorCategorias}
        />
      ) : null}

      {editandoMultiple ? (
        <EdicionMultiplePanel
          categorias={categorias}
          categoriaMultiple={categoriaMultiple}
          subcategoriaMultiple={subcategoriaMultiple}
          subcategoriasMultiplesDisponibles={subcategoriasMultiplesDisponibles}
          guardandoMultiple={guardandoMultiple}
          onCategoriaChange={(event) => {
            setCategoriaMultiple(event.target.value);
            setSubcategoriaMultiple("");
          }}
          onSubcategoriaChange={setSubcategoriaMultiple}
          onGuardarClasificacion={guardarClasificacionMultiple}
          onQuitarClasificacion={quitarClasificacionMultiple}
          onCancelar={cancelarEdicionMultiple}
        />
      ) : null}

      {loading ? <p className="estado">Cargando productos...</p> : null}
      {error ? <p className="estado error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <ProductosGrid
            productos={productosPaginados}
            totalProductos={productos.length}
            rangoInicio={rangoProductos.inicio}
            rangoFin={rangoProductos.fin}
            seleccionadosIds={seleccionadosIds}
            onToggleSeleccion={toggleSeleccion}
          />

          <footer className="productos-footer">
            <div className="productos-footer-resumen">
              <strong>
                Pagina {paginaActualSegura} de {totalPaginas}
              </strong>
              <span>
                Mostrando {rangoProductos.inicio}-{rangoProductos.fin} de{" "}
                {productos.length} productos filtrados
              </span>
            </div>

            <div className="productos-footer-acciones">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActualSegura === 1}
              >
                Anterior
              </button>

              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaActualSegura === totalPaginas || !productos.length}
              >
                Siguiente
              </button>
            </div>
          </footer>
        </>
      ) : null}
    </section>
  );
}
