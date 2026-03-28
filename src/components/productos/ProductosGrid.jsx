import { useState } from "react";
import { getProductoCardTheme } from "../../utils/productoCardTheme";

export default function ProductosGrid({
  productos,
  totalProductos,
  rangoInicio,
  rangoFin,
  seleccionadosIds,
  onToggleSeleccion,
}) {
  const [preview, setPreview] = useState(null);

  function handlePreviewEnter(event, producto) {
    if (!producto.imagenUrl) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const previewWidth = 220;
    const previewHeight = 220;
    const offset = 14;
    const padding = 16;

    let left = rect.right + offset;
    if (left + previewWidth > window.innerWidth - padding) {
      left = rect.left - previewWidth - offset;
    }
    if (left < padding) {
      left = Math.max(
        padding,
        Math.min(rect.left, window.innerWidth - previewWidth - padding)
      );
    }

    let top = rect.top;
    if (top + previewHeight > window.innerHeight - padding) {
      top = window.innerHeight - previewHeight - padding;
    }
    if (top < padding) {
      top = padding;
    }

    setPreview({
      src: producto.imagenUrl,
      alt: `Vista previa de ${producto.nombre}`,
      style: {
        left: `${left}px`,
        top: `${top}px`,
      },
    });
  }

  function handlePreviewLeave() {
    setPreview(null);
  }

  return (
    <>
      <div className="productos-resumen">
        {totalProductos ? (
          <>
            <strong>{totalProductos}</strong> productos encontrados. Mostrando{" "}
            {rangoInicio}-{rangoFin}.
          </>
        ) : (
          <>
            <strong>0</strong> productos encontrados
          </>
        )}
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
              onMouseEnter={(event) => handlePreviewEnter(event, producto)}
              onMouseLeave={handlePreviewLeave}
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

      {preview ? (
        <div className="producto-image-preview producto-image-preview--floating" style={preview.style} aria-hidden="true">
          <img src={preview.src} alt={preview.alt} loading="lazy" />
        </div>
      ) : null}

      {!productos.length ? (
        <p className="estado">No hay productos para esos filtros.</p>
      ) : null}
    </>
  );
}
