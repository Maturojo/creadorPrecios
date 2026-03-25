export function imprimirCarteles(productos) {
  if (!productos.length) {
    alert("No hay productos seleccionados para imprimir.");
    return;
  }

  const html = `
    <html>
      <head>
        <title>Carteles</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }

          .hoja {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .cartel {
            border: 2px solid #000;
            padding: 16px;
            min-height: 180px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
          }

          .codigo {
            font-size: 18px;
            font-weight: bold;
          }

          .nombre {
            font-size: 22px;
            font-weight: bold;
            margin: 12px 0;
          }

          .precio {
            font-size: 42px;
            font-weight: bold;
          }

          .categoria {
            font-size: 14px;
            color: #444;
            margin-top: 12px;
          }

          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="hoja">
          ${productos
            .map(
              (p) => `
                <div class="cartel">
                  <div class="codigo">${p.codigo}</div>
                  <div class="nombre">${p.nombre}</div>
                  <div class="precio">$${Number(p.precio || 0).toLocaleString("es-AR")}</div>
                  <div class="categoria">${p.categoria || "Sin clasificar"} / ${p.subcategoria || "Sin subcategoría"}</div>
                </div>
              `
            )
            .join("")}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank");
  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
}