export const Cartel = ({ producto }) => {
  // Función para redondear y dar formato de moneda
  const precioFormateado = Math.round(producto.precio).toLocaleString('es-AR');

  return (
    <div className="cartel-container">
      {/* Encabezado con la Familia */}
      <div className="familia-tag">
        {producto.familia || 'GENERAL'}
      </div>

      {/* Nombre del Producto */}
      <div className="nombre-producto">
        {producto.nombre}
      </div>

      {/* Precio Gigante */}
      <div className="precio-contenedor">
        <span className="signo-peso">$</span>
        <span className="monto">{precioFormateado}</span>
      </div>

      {/* Pie del cartel */}
      <div className="pie-cartel">
        <span className="codigo">COD: {producto.id}</span>
        <span className="leyenda">EFECTIVO / TRANSFERENCIA</span>
      </div>

      <style jsx>{`
        .cartel-container {
          width: 10cm;
          height: 7cm;
          border: 4px solid black;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          margin: 10px;
          background-color: white;
          position: relative;
          page-break-inside: avoid;
        }

        .familia-tag {
          background-color: black;
          color: white;
          align-self: flex-start;
          padding: 2px 10px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .nombre-producto {
          font-size: 26px;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          line-height: 1.1;
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
        }

        .precio-contenedor {
          text-align: center;
          margin-bottom: 5px;
        }

        .signo-peso {
          font-size: 30px;
          font-weight: 900;
          vertical-align: top;
          margin-right: 4px;
        }

        .monto {
          font-size: 80px;
          font-weight: 950;
          letter-spacing: -4px;
          font-style: italic;
        }

        .pie-cartel {
          border-top: 2px solid #eee;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 10px;
          font-weight: bold;
          color: #333;
        }

        @media print {
          .cartel-container {
            margin: 0;
            border: 2px solid black;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};