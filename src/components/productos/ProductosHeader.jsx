import { useEffect, useRef, useState } from "react";

function IconButton({ label, title, onClick, disabled = false, active = false, children }) {
  return (
    <button
      type="button"
      className={`icon-action-btn${active ? " icon-action-btn--active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
    >
      {children}
    </button>
  );
}

export default function ProductosHeader({
  productosCount,
  totalFiltradosCount,
  seleccionadosCount,
  todosSeleccionados,
  todosFiltradosSeleccionados,
  mostrandoHistorial,
  formatoImpresion,
  modoAgrupacionImpresion,
  exportandoProductos,
  onToggleSeleccionTodos,
  onToggleSeleccionFiltrados,
  onDeseleccionarTodos,
  onAbrirEditorMultiple,
  onAbrirEditorCategorias,
  onExportarProductos,
  onToggleHistorial,
  onFormatoImpresionChange,
  onModoAgrupacionImpresionChange,
  onImprimir,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuAbierto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="productos-header">
      <div className="productos-header-copy">
        <h1>Productos</h1>
        <p>Ver, filtrar, clasificar manualmente e imprimir carteles.</p>
      </div>

      <div className="acciones-header">
        <div className="acciones-header-group acciones-header-group--primary">
          <button
            className="btn-outline"
            onClick={onToggleSeleccionTodos}
            disabled={!productosCount}
          >
            {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
          </button>

          <button
            className="btn-outline"
            onClick={onToggleSeleccionFiltrados}
            disabled={!totalFiltradosCount}
          >
            {todosFiltradosSeleccionados
              ? "Deseleccionar filtrados"
              : "Seleccionar filtrados"}
          </button>

          <button
            className="btn-outline"
            onClick={onDeseleccionarTodos}
            disabled={!seleccionadosCount}
          >
            Limpiar seleccion
          </button>
        </div>

        <div className="acciones-header-group acciones-header-group--secondary">
          <label className="print-config">
            <span>Formato de cartel</span>
            <select
              value={formatoImpresion}
              onChange={(event) => onFormatoImpresionChange(event.target.value)}
              className="select-impresion"
            >
              <option value="a4">A4 completa</option>
              <option value="media-a4">Media hoja</option>
            </select>
          </label>

          <label className="print-config">
            <span>Agrupacion</span>
            <select
              value={modoAgrupacionImpresion}
              onChange={(event) =>
                onModoAgrupacionImpresionChange(event.target.value)
              }
              className="select-impresion"
            >
              <option value="clasificacion">Separar por categoria</option>
              <option value="mezclar">Mezclar seleccion</option>
            </select>
          </label>

          <div className="acciones-header-iconos" aria-label="Acciones rapidas">
            <IconButton
              label={exportandoProductos ? "Exportando CSV" : "Exportar CSV"}
              title={exportandoProductos ? "Exportando CSV..." : "Exportar CSV"}
              onClick={onExportarProductos}
              disabled={exportandoProductos}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3v10m0 0 4-4m-4 4-4-4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>

            <IconButton
              label={mostrandoHistorial ? "Ocultar historial" : "Ver historial"}
              title={mostrandoHistorial ? "Ocultar historial" : "Ver historial"}
              onClick={onToggleHistorial}
              active={mostrandoHistorial}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 8v4l2.5 2.5M21 12a9 9 0 1 1-2.64-6.36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          </div>

          <div className="menu-acciones" ref={menuRef}>
            <button
              type="button"
              className={`icon-action-btn${menuAbierto ? " icon-action-btn--active" : ""}`}
              onClick={() => setMenuAbierto((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              aria-label="Mas opciones"
              title="Mas opciones"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8 3.5-.86-.5a1 1 0 0 1-.48-1.13l.17-.97a1 1 0 0 0-.73-1.15l-.96-.26a1 1 0 0 1-.72-.98V6a1 1 0 0 0-1-1h-1.04a1 1 0 0 1-.98-.72l-.26-.96a1 1 0 0 0-1.15-.73l-.97.17a1 1 0 0 1-1.13-.48L12 2l-.5.86a1 1 0 0 1-1.13.48l-.97-.17a1 1 0 0 0-1.15.73l-.26.96a1 1 0 0 1-.98.72H6a1 1 0 0 0-1 1v1.04a1 1 0 0 1-.72.98l-.96.26a1 1 0 0 0-.73 1.15l.17.97a1 1 0 0 1-.48 1.13L2 12l.86.5a1 1 0 0 1 .48 1.13l-.17.97a1 1 0 0 0 .73 1.15l.96.26a1 1 0 0 1 .72.98V18a1 1 0 0 0 1 1h1.04a1 1 0 0 1 .98.72l.26.96a1 1 0 0 0 1.15.73l.97-.17a1 1 0 0 1 1.13.48L12 22l.5-.86a1 1 0 0 1 1.13-.48l.97.17a1 1 0 0 0 1.15-.73l.26-.96a1 1 0 0 1 .98-.72H18a1 1 0 0 0 1-1v-1.04a1 1 0 0 1 .72-.98l.96-.26a1 1 0 0 0 .73-1.15l-.17-.97a1 1 0 0 1 .48-1.13L22 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {menuAbierto ? (
              <div className="menu-acciones-dropdown" role="menu">
                <button
                  type="button"
                  className="menu-acciones-item"
                  onClick={() => {
                    setMenuAbierto(false);
                    onAbrirEditorMultiple();
                  }}
                  disabled={!seleccionadosCount}
                >
                  Editar clasificacion ({seleccionadosCount})
                </button>

                <button
                  type="button"
                  className="menu-acciones-item"
                  onClick={() => {
                    setMenuAbierto(false);
                    onAbrirEditorCategorias();
                  }}
                >
                  Editar categorias
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <button
          className="btn-print"
          onClick={onImprimir}
          disabled={!seleccionadosCount}
        >
          Preparar impresion ({seleccionadosCount})
        </button>
      </div>
    </div>
  );
}
