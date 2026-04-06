import { useEffect } from "react";

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
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !guardandoMultiple) {
        onCancelar();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [guardandoMultiple, onCancelar]);

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!guardandoMultiple) {
          onCancelar();
        }
      }}
    >
      <div
        className="editor-multiple editor-multiple-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="editor-multiple-header">
          <div>
            <h3>Editar clasificacion de seleccionados</h3>
            <p>Aplica la categoria y subcategoria a toda la seleccion.</p>
          </div>

          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={onCancelar}
            disabled={guardandoMultiple}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

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
    </div>
  );
}
