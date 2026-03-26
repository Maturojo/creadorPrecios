export function imprimirCarteles(productos) {
  if (!productos.length) {
    alert("No hay productos seleccionados para imprimir.");
    return;
  }

  const MAX_PRODUCTOS_POR_CARTEL = 6;

  const chunkArray = (array, size) => {
    const resultado = [];
    for (let i = 0; i < array.length; i += size) {
      resultado.push(array.slice(i, i + size));
    }
    return resultado;
  };

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

  const escaparHtml = (texto) => {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const crearFilas = (items, minFilas = MAX_PRODUCTOS_POR_CARTEL) => {
    let filas = items
      .map(
        (p) => `
          <tr>
            <td>${escaparHtml(p.codigo)}</td>
            <td>${escaparHtml(p.nombre || p.descripcion || "")}</td>
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

  const gruposBase = agruparProductos(productos);

  const gruposPaginados = gruposBase.flatMap((grupo) => {
    const itemsOrdenados = [...grupo.items].sort((a, b) => {
      const nombreA = (a.nombre || a.descripcion || "").trim();
      const nombreB = (b.nombre || b.descripcion || "").trim();
      return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
    });

    const bloques = chunkArray(itemsOrdenados, MAX_PRODUCTOS_POR_CARTEL);

    return bloques.map((bloque, index) => ({
      categoria: grupo.categoria,
      subcategoria: grupo.subcategoria,
      items: bloque,
      numeroCartel: index + 1,
      totalCarteles: bloques.length,
    }));
  });

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

          .cartel-info {
            margin-top: 12px;
            font-size: 18px;
            font-weight: 700;
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
        ${gruposPaginados
          .map(
            (grupo) => `
              <section class="cartel">
                <div class="cartel-header">
                  <h1 class="subcategoria">${escaparHtml(grupo.subcategoria)}</h1>
                  <h2 class="categoria">${escaparHtml(grupo.categoria)}</h2>
                  ${
                    grupo.totalCarteles > 1
                      ? `<div class="cartel-info">Cartel ${grupo.numeroCartel} de ${grupo.totalCarteles}</div>`
                      : ""
                  }
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
                      ${crearFilas(grupo.items)}
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