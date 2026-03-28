export default function EliminarClasificacionPanel({
  categorias,
  categoriaAEliminar,
  subcategoriaAEliminar,
  subcategoriasEliminarDisponibles,
  eliminandoClasificacion,
  onCategoriaChange,
  onSubcategoriaChange,
  onEliminarCategoriaCompleta,
  onEliminarSubcategoriaIndividual,
  onCancelar,
}) {
  return (
    <div className="editor-multiple">
      <h3>Eliminar categoria o subcategoria</h3>

      <div className="editor-multiple-filtros">
        <select value={categoriaAEliminar} onChange={onCategoriaChange}>
          <option value="">Seleccionar categoria</option>
          {categorias
            .filter((categoria) => categoria !== "Sin clasificar")
            .map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
        </select>

        <select
          value={subcategoriaAEliminar}
          onChange={(event) => onSubcategoriaChange(event.target.value)}
          disabled={!categoriaAEliminar}
        >
          <option value="">Seleccionar subcategoria (opcional)</option>
          {subcategoriasEliminarDisponibles
            .filter((subcategoria) => subcategoria !== "Sin subcategoría")
            .map((subcategoria) => (
              <option key={subcategoria} value={subcategoria}>
                {subcategoria}
              </option>
            ))}
        </select>
      </div>

      <div className="acciones-edicion">
        <button
          className="btn-text btn-text-danger"
          onClick={onEliminarCategoriaCompleta}
          disabled={!categoriaAEliminar || eliminandoClasificacion}
        >
          Eliminar categoria completa
        </button>

        <button
          className="btn-text btn-text-danger"
          onClick={onEliminarSubcategoriaIndividual}
          disabled={
            !categoriaAEliminar ||
            !subcategoriaAEliminar ||
            eliminandoClasificacion
          }
        >
          Eliminar solo subcategoria
        </button>

        <button
          className="btn-outline"
          onClick={onCancelar}
          disabled={eliminandoClasificacion}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
