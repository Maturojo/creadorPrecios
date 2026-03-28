import { getProductoCardTheme } from "../../utils/productoCardTheme";

export default function ProductosGrid({
  productos,
  seleccionadosIds,
  onToggleSeleccion,
}) {
  return (
    <>
      <div className="productos-resumen">
        <strong>{productos.length}</strong> productos encontrados
      </div>

      <div className="productos-grid">
        {productos.map((producto) => {
          const estaSeleccionado = seleccionadosIds.has(producto._id);
          const colorTheme = getProductoCardTheme(
            producto.categoria,
            producto.subcategoria
          );

          return (
            <article
              className={`producto-card ${estaSeleccionado ? "seleccionado" : ""}`}
              key={producto._id}
              style={colorTheme}
            >
              {producto.imagenUrl ? (
                <div className="producto-image-preview" aria-hidden="true">
                  <img
                    src={producto.imagenUrl}
                    alt={`Vista previa de ${producto.nombre}`}
                    loading="lazy"
                  />
                </div>
              ) : null}

              <label className="producto-check">
                <input
                  type="checkbox"
                  checked={estaSeleccionado}
                  onChange={() => onToggleSeleccion(producto)}
                />
                Seleccionar
              </label>

              <div className="producto-card-top">
                <div className="producto-codigo-wrap">
                  <span className="producto-codigo">{producto.codigo}</span>
                  {producto.imagenUrl ? (
                    <span className="producto-foto-badge" title="Tiene foto">
                      Foto
                    </span>
                  ) : null}
                </div>
                <span className="producto-precio">
                  ${Number(producto.precio || 0).toLocaleString("es-AR")}
                </span>
              </div>

              <h3>{producto.nombre}</h3>

              <div className="producto-tags">
                <span>{producto.categoria}</span>
                <span>{producto.subcategoria}</span>
              </div>
            </article>
          );
        })}
      </div>

      {!productos.length ? (
        <p className="estado">No hay productos para esos filtros.</p>
      ) : null}
    </>
  );
}
