export default function HistorialPanel({
  historialAcciones,
  onLimpiarHistorial,
  formatearFechaHistorial,
}) {
  return (
    <div className="editor-multiple">
      <div className="historial-header">
        <h3>Historial de acciones</h3>

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
                <span>{formatearFechaHistorial(item.fecha)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
