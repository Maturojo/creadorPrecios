export function imprimirCarteles(productos) {
  if (!productos.length) {
    alert("No hay productos seleccionados para imprimir.");
    return;
  }

  const agruparProductos = (lista) => {
    const grupos = {};

    lista.forEach((p) => {
      const categoria = (p.categoria || "Sin clasificar").trim();
      const subcategoria = (p.subcategoria || "Sin subcategoría").trim();
      const key = `${categoria}|||${subcategoria}`;

      if (!grupos[key]) {
        grupos[key] = {
          categoria,
          subcategoria,
          items: [],
        };
      }

      grupos[key].items.push(p);
    });

    return Object.values(grupos);
  };

  const formatearPrecio = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-AR")}`;
  };

  const crearFilas = (items, minFilas = 6) => {
    let filas = items
      .map(
        (p) => `
          <tr>
            <td>${p.codigo || ""}</td>
            <td>${p.nombre || p.descripcion || ""}</td>
            <td>${formatearPrecio(p.precio)}</td>
          </tr>
        `
      )
      .join("");

    const faltantes = Math.max(0, minFilas - items.length);

    for (let i = 0; i < faltantes; i++) {
      filas += `
        <tr>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `;
    }

    return filas;
  };

  const grupos = agruparProductos(productos);

  const html = `
    <html>
      <head>
        <title>Carteles</title>
        <style>
          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: white;
          }

          body {
            padding: 0;
          }

          .cartel {
            width: 100%;
            min-height: 100vh;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            background: white;
          }

          .cartel-header {
            border-top: 8px solid black;
            border-bottom: 8px solid black;
            padding: 34px 50px 24px 50px;
          }

          .subcategoria {
            margin: 0;
            font-size: 72px;
            font-weight: 900;
            line-height: 1;
          }

          .categoria {
            margin: 10px 0 0 0;
            font-size: 30px;
            font-weight: 700;
            line-height: 1.1;
          }

          .cartel-tabla-wrap {
            padding: 18px 55px 0 55px;
            flex: 1;
          }

          .cartel-tabla {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .cartel-tabla th,
          .cartel-tabla td {
            border: 3px solid black;
            text-align: center;
            vertical-align: middle;
            padding: 10px 12px;
          }

          .cartel-tabla th {
            font-size: 36px;
            font-weight: 900;
          }

          .cartel-tabla td {
            font-size: 24px;
            height: 56px;
          }

          .cartel-tabla th:nth-child(1),
          .cartel-tabla td:nth-child(1) {
            width: 20%;
          }

          .cartel-tabla th:nth-child(2),
          .cartel-tabla td:nth-child(2) {
            width: 57%;
          }

          .cartel-tabla th:nth-child(3),
          .cartel-tabla td:nth-child(3) {
            width: 23%;
          }

          @media print {
            html, body {
              width: 100%;
              height: auto;
            }

            .cartel {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        ${grupos
          .map(
            (grupo) => `
              <section class="cartel">
                <div class="cartel-header">
                  <h1 class="subcategoria">${grupo.subcategoria}</h1>
                  <h2 class="categoria">${grupo.categoria}</h2>
                </div>

                <div class="cartel-tabla-wrap">
                  <table class="cartel-tabla">
                    <thead>
                      <tr>
                        <th>Cód.</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${crearFilas(grupo.items, 6)}
                    </tbody>
                  </table>
                </div>
              </section>
            `
          )
          .join("")}

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank");

  if (!ventana) {
    alert("No se pudo abrir la ventana de impresión. Revisá si el navegador está bloqueando popups.");
    return;
  }

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
}