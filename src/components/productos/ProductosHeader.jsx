export default function ProductosHeader({
  productosCount,
  seleccionadosCount,
  todosSeleccionados,
  mostrandoHistorial,
  formatoImpresion,
  onToggleSeleccionTodos,
  onDeseleccionarTodos,
  onAbrirEditorMultiple,
  onAbrirEditorCategorias,
  onAbrirEliminarClasificacion,
  onToggleHistorial,
  onFormatoImpresionChange,
  onImprimir,
}) {
  return (
    <div className="productos-header">
      <div>
        <h1>Productos</h1>
        <p>Ver, filtrar, clasificar manualmente e imprimir carteles.</p>
      </div>

      <div className="acciones-header">
        <button
          className="btn-secundario"
          onClick={onToggleSeleccionTodos}
          disabled={!productosCount}
        >
          {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
        </button>

        <button
          className="btn-secundario"
          onClick={onDeseleccionarTodos}
          disabled={!seleccionadosCount}
        >
          Limpiar seleccion
        </button>

        <button
          className="btn-secundario"
          onClick={onAbrirEditorMultiple}
          disabled={!seleccionadosCount}
        >
          Editar clasificacion ({seleccionadosCount})
        </button>

        <button className="btn-secundario" onClick={onAbrirEditorCategorias}>
          Nueva categoria / subcategoria
        </button>

        <button
          className="btn-secundario"
          onClick={onAbrirEliminarClasificacion}
        >
          Eliminar categoria / subcategoria
        </button>

        <button className="btn-secundario" onClick={onToggleHistorial}>
          {mostrandoHistorial ? "Ocultar historial" : "Ver historial"}
        </button>

        <select
          value={formatoImpresion}
          onChange={(event) => onFormatoImpresionChange(event.target.value)}
          className="btn-secundario"
        >
          <option value="a4">A4 completa</option>
          <option value="media-a4">Media hoja</option>
        </select>

        <button
          className="btn-secundario"
          onClick={onImprimir}
          disabled={!seleccionadosCount}
        >
          Imprimir ({seleccionadosCount})
        </button>
      </div>
    </div>
  );
}
