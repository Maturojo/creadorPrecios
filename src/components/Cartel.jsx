function formatearPrecio(valor) {
  const numero = Number(valor || 0);

  return numero.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function Cartel({ producto }) {
  const nombre = producto?.nombre || "SIN NOMBRE";
  const precio = producto?.precio || 0;
  const codigo = producto?.codigo || producto?.barras || "";
  const familia = producto?.familia || "SIN CLASIFICAR";
  const subfamilia = producto?.subfamilia || "";

  return (
    <div
      style={{
        border: "4px solid black",
        padding: "24px",
        backgroundColor: "white",
        minHeight: "390px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "black",
            color: "white",
            padding: "6px 14px",
            fontWeight: "bold",
            fontSize: "22px",
            marginBottom: "28px",
            textTransform: "uppercase",
          }}
        >
          {familia}
        </div>

        {subfamilia ? (
          <div
            style={{
              marginBottom: "14px",
              fontSize: "18px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {subfamilia}
          </div>
        ) : null}

        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "30px",
            lineHeight: 1.2,
            textTransform: "uppercase",
            marginTop: "18px",
            marginBottom: "48px",
            minHeight: "80px",
          }}
        >
          {nombre}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              lineHeight: 1,
              marginTop: "16px",
            }}
          >
            $
          </span>

          <span
            style={{
              fontSize: "96px",
              fontWeight: "bold",
              fontStyle: "italic",
              lineHeight: 0.95,
            }}
          >
            {formatearPrecio(precio)}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: "2px solid #ddd",
          paddingTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "16px",
          fontWeight: "bold",
          textTransform: "uppercase",
          gap: "12px",
        }}
      >
        <span>COD: {codigo}</span>
        <span>EFECTIVO / TRANSFERENCIA</span>
      </div>
    </div>
  );
}

export default Cartel;