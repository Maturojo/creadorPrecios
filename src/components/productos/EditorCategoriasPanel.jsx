import { useEffect, useState } from "react";

export default function EditorCategoriasPanel({
  categorias,
  subcategoriasPorCategoria,
  categoriaBaseNuevaSub,
  nuevaCategoria,
  nuevaSubcategoria,
  errorNuevaClasificacion,
  categoriaEditar,
  nuevoNombreCategoria,
  categoriaSubcategoriaEditar,
  subcategoriaEditar,
  nuevaCategoriaSubcategoria,
  nuevoNombreSubcategoria,
  categoriaAEliminar,
  subcategoriaAEliminar,
  subcategoriasEliminarDisponibles,
  eliminandoClasificacion,
  onCategoriaBaseChange,
  onNuevaCategoriaChange,
  onNuevaSubcategoriaChange,
  onCategoriaEditarChange,
  onNuevoNombreCategoriaChange,
  onCategoriaSubcategoriaEditarChange,
  onSubcategoriaEditarChange,
  onNuevaCategoriaSubcategoriaChange,
  onNuevoNombreSubcategoriaChange,
  onCategoriaEliminarChange,
  onSubcategoriaEliminarChange,
  onGuardar,
  onGuardarCategoriaEditada,
  onGuardarSubcategoriaEditada,
  onEliminarCategoriaCompleta,
  onEliminarSubcategoriaIndividual,
  onCancelar,
}) {
  const [seccionActiva, setSeccionActiva] = useState("crear");

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
            <h3>Gestionar categorias y subcategorias</h3>
            <p>Crea, edita o elimina clasificaciones sin perderte en una ventana larga.</p>
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

        <div className="editor-categorias-tabs" role="tablist" aria-label="Acciones de categorias">
          <button
            type="button"
            className={`editor-categorias-tab ${
              seccionActiva === "crear" ? "editor-categorias-tab--activa" : ""
            }`}
            onClick={() => setSeccionActiva("crear")}
          >
            Crear
          </button>

          <button
            type="button"
            className={`editor-categorias-tab ${
              seccionActiva === "editar-categoria"
                ? "editor-categorias-tab--activa"
                : ""
            }`}
            onClick={() => setSeccionActiva("editar-categoria")}
          >
            Editar categoria
          </button>

          <button
            type="button"
            className={`editor-categorias-tab ${
              seccionActiva === "editar-subcategoria"
                ? "editor-categorias-tab--activa"
                : ""
            }`}
            onClick={() => setSeccionActiva("editar-subcategoria")}
          >
            Editar subcategoria
          </button>

          <button
            type="button"
            className={`editor-categorias-tab ${
              seccionActiva === "eliminar" ? "editor-categorias-tab--activa" : ""
            }`}
            onClick={() => setSeccionActiva("eliminar")}
          >
            Eliminar
          </button>
        </div>

        <div className="editor-categorias-layout">
          {seccionActiva === "crear" ? (
            <section className="editor-categorias-bloque">
              <h4>Crear</h4>
              <p className="editor-categorias-ayuda">
                Crea una categoria nueva o sumale una subcategoria a una existente.
              </p>

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

              <div className="acciones-edicion">
                <button className="btn-secundario" onClick={onGuardar}>
                  Guardar
                </button>
              </div>
            </section>
          ) : null}

          {seccionActiva === "editar-categoria" ? (
            <section className="editor-categorias-bloque">
              <h4>Editar categoria</h4>
              <p className="editor-categorias-ayuda">
                Cambia el nombre de una categoria y se actualizan sus productos.
              </p>

              <div className="editor-multiple-filtros">
                <select
                  value={categoriaEditar}
                  onChange={(event) => onCategoriaEditarChange(event.target.value)}
                >
                  <option value="">Seleccionar categoria</option>
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
                  placeholder="Nuevo nombre de categoria"
                  value={nuevoNombreCategoria}
                  onChange={(event) =>
                    onNuevoNombreCategoriaChange(event.target.value)
                  }
                  disabled={!categoriaEditar}
                />
              </div>

              <div className="acciones-edicion">
                <button
                  className="btn-secundario"
                  onClick={onGuardarCategoriaEditada}
                  disabled={!categoriaEditar || !nuevoNombreCategoria.trim()}
                >
                  Guardar cambio
                </button>
              </div>
            </section>
          ) : null}

          {seccionActiva === "editar-subcategoria" ? (
            <section className="editor-categorias-bloque">
              <h4>Editar subcategoria</h4>
              <p className="editor-categorias-ayuda">
                Renombra una subcategoria o movela a otra categoria.
              </p>

              <div className="editor-multiple-filtros">
                <select
                  value={categoriaSubcategoriaEditar}
                  onChange={(event) =>
                    onCategoriaSubcategoriaEditarChange(event.target.value)
                  }
                >
                  <option value="">Categoria actual</option>
                  {categorias
                    .filter((categoria) => categoria !== "Sin clasificar")
                    .map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                </select>

                <select
                  value={subcategoriaEditar}
                  onChange={(event) => onSubcategoriaEditarChange(event.target.value)}
                  disabled={!categoriaSubcategoriaEditar}
                >
                  <option value="">Subcategoria actual</option>
                  {(subcategoriasPorCategoria[categoriaSubcategoriaEditar] || [])
                    .filter((subcategoria) => subcategoria !== "Sin subcategoría")
                    .map((subcategoria) => (
                      <option key={subcategoria} value={subcategoria}>
                        {subcategoria}
                      </option>
                    ))}
                </select>

                <select
                  value={nuevaCategoriaSubcategoria}
                  onChange={(event) =>
                    onNuevaCategoriaSubcategoriaChange(event.target.value)
                  }
                  disabled={!subcategoriaEditar}
                >
                  <option value="">Nueva categoria</option>
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
                  placeholder="Nuevo nombre de subcategoria"
                  value={nuevoNombreSubcategoria}
                  onChange={(event) =>
                    onNuevoNombreSubcategoriaChange(event.target.value)
                  }
                  disabled={!subcategoriaEditar}
                />
              </div>

              <div className="acciones-edicion">
                <button
                  className="btn-secundario"
                  onClick={onGuardarSubcategoriaEditada}
                  disabled={
                    !categoriaSubcategoriaEditar ||
                    !subcategoriaEditar ||
                    !nuevaCategoriaSubcategoria ||
                    !nuevoNombreSubcategoria.trim()
                  }
                >
                  Guardar cambio
                </button>
              </div>
            </section>
          ) : null}

          {seccionActiva === "eliminar" ? (
            <section className="editor-categorias-bloque editor-categorias-bloque--danger">
              <h4>Eliminar</h4>
              <p className="editor-categorias-ayuda">
                Elimina una categoria completa o solo una subcategoria puntual.
              </p>

              <div className="editor-multiple-filtros">
                <select
                  value={categoriaAEliminar}
                  onChange={(event) => onCategoriaEliminarChange(event.target.value)}
                >
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
                  onChange={(event) =>
                    onSubcategoriaEliminarChange(event.target.value)
                  }
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
              </div>
            </section>
          ) : null}
        </div>

        {errorNuevaClasificacion ? (
          <p className="estado error">{errorNuevaClasificacion}</p>
        ) : null}

        <div className="acciones-edicion">
          <button className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
