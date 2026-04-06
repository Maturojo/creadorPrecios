import { useEffect } from "react";

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
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onCancelar();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancelar]);

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div
        className="editor-multiple editor-multiple-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="editor-multiple-header">
          <div>
            <h3>Agregar categoria o subcategoria</h3>
            <p>Crea una categoria nueva o sumale una subcategoria a una existente.</p>
          </div>

          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={onCancelar}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

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
    </div>
  );
}
