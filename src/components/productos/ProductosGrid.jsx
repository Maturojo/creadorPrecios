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

          return (
            <article
              className={`producto-card ${estaSeleccionado ? "seleccionado" : ""}`}
              key={producto._id}
            >
              <label className="producto-check">
                <input
                  type="checkbox"
                  checked={estaSeleccionado}
                  onChange={() => onToggleSeleccion(producto)}
                />
                Seleccionar
              </label>

              <div className="producto-card-top">
                <span className="producto-codigo">{producto.codigo}</span>
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
