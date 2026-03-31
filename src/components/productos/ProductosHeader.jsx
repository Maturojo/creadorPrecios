import { useEffect, useRef, useState } from "react";

export default function ProductosHeader({
  productosCount,
  totalFiltradosCount,
  seleccionadosCount,
  todosSeleccionados,
  todosFiltradosSeleccionados,
  mostrandoHistorial,
  formatoImpresion,
  modoAgrupacionImpresion,
  onToggleSeleccionTodos,
  onToggleSeleccionFiltrados,
  onDeseleccionarTodos,
  onAbrirEditorMultiple,
  onAbrirEditorCategorias,
  onAbrirEliminarClasificacion,
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

          <button className="btn-outline" onClick={onAbrirEditorCategorias}>
            Nueva categoria
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

          <div className="menu-acciones" ref={menuRef}>
            <button
              type="button"
              className="btn-text btn-text-menu"
              onClick={() => setMenuAbierto((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
            >
              Mas opciones
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
                    onToggleHistorial();
                  }}
                >
                  {mostrandoHistorial ? "Ocultar historial" : "Ver historial"}
                </button>

                <button
                  type="button"
                  className="menu-acciones-item menu-acciones-item-danger"
                  onClick={() => {
                    setMenuAbierto(false);
                    onAbrirEliminarClasificacion();
                  }}
                >
                  Eliminar categoria
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
