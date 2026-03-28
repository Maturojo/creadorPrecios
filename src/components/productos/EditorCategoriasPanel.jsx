export default function EditorCategoriasPanel({
  categorias,
  categoriaBaseNuevaSub,
  nuevaCategoria,
  nuevaSubcategoria,
  errorNuevaClasificacion,
  onCategoriaBaseChange,
  onNuevaCategoriaChange,
  onNuevaSubcategoriaChange,
  onGuardar,
  onCancelar,
}) {
  return (
    <div className="editor-multiple">
      <h3>Agregar categoria o subcategoria</h3>

      <div className="editor-multiple-filtros">
        <select
          value={categoriaBaseNuevaSub}
          onChange={(event) => onCategoriaBaseChange(event.target.value)}
        >
          <option value="">Elegir categoria existente</option>
          {categorias
            .filter((categoria) => categoria !== "Sin clasificar")
            .map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
        </select>

        <input
          type="text"
          placeholder="O escribir categoria nueva"
          value={nuevaCategoria}
          onChange={(event) => onNuevaCategoriaChange(event.target.value)}
        />

        <input
          type="text"
          placeholder="Subcategoria nueva (opcional)"
          value={nuevaSubcategoria}
          onChange={(event) => onNuevaSubcategoriaChange(event.target.value)}
        />
      </div>

      {errorNuevaClasificacion ? (
        <p className="estado error">{errorNuevaClasificacion}</p>
      ) : null}

      <div className="acciones-edicion">
        <button className="btn-secundario" onClick={onGuardar}>
          Guardar
        </button>

        <button className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
