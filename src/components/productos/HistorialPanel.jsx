import { useEffect } from "react";

export default function HistorialPanel({
  historialAcciones,
  onLimpiarHistorial,
  formatearFechaHistorial,
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
        className="editor-multiple editor-multiple-modal historial-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="editor-multiple-header">
          <div>
            <h3>Historial de acciones</h3>
            <p>Revisa cambios recientes, limpiezas y clasificaciones realizadas.</p>
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

        <div className="historial-header">
          <button
            className="btn-secundario"
            onClick={onLimpiarHistorial}
            disabled={!historialAcciones.length}
          >
            Limpiar historial
          </button>
        </div>

        {!historialAcciones.length ? (
          <p className="estado">Todavia no hay acciones registradas.</p>
        ) : (
          <div className="historial-lista">
            {historialAcciones.map((item) => (
              <div key={item.id || item._id} className="historial-item">
                <div className="historial-item-top">
                  <strong>{item.descripcion}</strong>
                </div>
                <div className="historial-item-meta">
                  <span>
                    {item.usuarioNombre || item.usuarioEmail
                      ? `Por ${item.usuarioNombre || item.usuarioEmail}${
                          item.usuarioNombre && item.usuarioEmail
                            ? ` (${item.usuarioEmail})`
                            : ""
                        }`
                      : "Usuario no registrado"}
                  </span>
                  <span>{formatearFechaHistorial(item.fecha)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
