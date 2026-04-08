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
  modoCartelImpresion,
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
  onModoCartelImpresionChange,
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
            <span>Modo de cartel</span>
            <select
              value={modoCartelImpresion}
              onChange={(event) =>
                onModoCartelImpresionChange(event.target.value)
              }
              className="select-impresion"
            >
              <option value="agrupado">Por seleccion</option>
              <option value="individual">Individual por producto</option>
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
              disabled={modoCartelImpresion === "individual"}
            >
              <option value="clasificacion">Separar por categoria</option>
              <option value="mezclar">Mezclar seleccion</option>
            </select>
          </label>

        </div>

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
                  d="M10.2 3.4h3.6l.5 2a6.9 6.9 0 0 1 1.6.9l2-.7 1.8 3.1-1.5 1.5c.1.5.2 1.1.2 1.7s-.1 1.2-.2 1.7l1.5 1.5-1.8 3.1-2-.7a6.9 6.9 0 0 1-1.6.9l-.5 2h-3.6l-.5-2a6.9 6.9 0 0 1-1.6-.9l-2 .7-1.8-3.1 1.5-1.5A7.8 7.8 0 0 1 5.4 12c0-.6.1-1.2.2-1.7L4.1 8.8l1.8-3.1 2 .7a6.9 6.9 0 0 1 1.6-.9l.7-2.1Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
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
