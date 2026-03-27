import cartelPrintCssUrl from "../styles/carteles-print.css?url";

export function imprimirCarteles(productos, formato = "a4") {
  if (!productos.length) {
    alert("No hay productos seleccionados para imprimir.");
    return;
  }

  const CONFIG_FORMATO = {
    a4: {
      maxProductosPorCartel: 22,
      bodyClass: "formato-a4",
    },
    "media-a4": {
      maxProductosPorCartel: 8,
      bodyClass: "formato-a4",
    },
  };

  const config = CONFIG_FORMATO[formato] || CONFIG_FORMATO.a4;
  const MAX_PRODUCTOS_POR_CARTEL = config.maxProductosPorCartel;

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

  const crearFilas = (items) => {
    return items
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
  };

  const gruposBase = agruparProductos(productos);

  // Cada bloque paginado genera SU PROPIO cartel completo con encabezado repetido
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
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Carteles</title>
        <link rel="stylesheet" href="${cartelPrintCssUrl}" />
      </head>
      <body class="${config.bodyClass}">
        ${gruposPaginados
          .map(
            (grupo) => `
              <section class="cartel">
                <div class="cartel-header">
                  ${
                    grupo.subcategoria &&
                    grupo.subcategoria !== "Sin subcategoría"
                      ? `
                        <h1 class="subcategoria">${escaparHtml(grupo.subcategoria)}</h1>
                        <h2 class="categoria">${escaparHtml(grupo.categoria)}</h2>
                      `
                      : `
                        <h1 class="subcategoria solo-categoria">${escaparHtml(grupo.categoria)}</h1>
                      `
                  }

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
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank");

  if (!ventana) {
    alert(
      "No se pudo abrir la ventana de impresión. Revisá si el navegador está bloqueando popups."
    );
    return;
  }

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();

  ventana.onload = () => {
    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 500);
  };
}