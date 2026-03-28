export default function EdicionMultiplePanel({
  categorias,
  categoriaMultiple,
  subcategoriaMultiple,
  subcategoriasMultiplesDisponibles,
  guardandoMultiple,
  onCategoriaChange,
  onSubcategoriaChange,
  onGuardarClasificacion,
  onQuitarClasificacion,
  onCancelar,
}) {
  return (
    <div className="editor-multiple">
      <h3>Editar clasificacion de seleccionados</h3>

      <div className="editor-multiple-filtros">
        <select value={categoriaMultiple} onChange={onCategoriaChange}>
          <option value="">Sin clasificar</option>
          {categorias
            .filter((categoria) => categoria !== "Sin clasificar")
            .map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
        </select>

        <select
          value={subcategoriaMultiple}
          onChange={(event) => onSubcategoriaChange(event.target.value)}
          disabled={!categoriaMultiple}
        >
          <option value="">Sin subcategoría</option>
          {subcategoriasMultiplesDisponibles
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
          className="btn-secundario"
          onClick={onGuardarClasificacion}
          disabled={guardandoMultiple}
        >
          Guardar clasificacion
        </button>

        <button
          className="btn-secundario"
          onClick={onQuitarClasificacion}
          disabled={guardandoMultiple}
        >
          Quitar clasificacion
        </button>

        <button
          className="btn-secundario"
          onClick={onCancelar}
          disabled={guardandoMultiple}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
