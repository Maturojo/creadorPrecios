import cartelPrintCssUrl from "../styles/carteles-preview-print.css?url";

const SIN_SUBCATEGORIA = "Sin subcategoría";

export function imprimirCarteles(productos, formato = "a4") {
  if (!productos.length) {
    alert("No hay productos seleccionados para imprimir.");
    return;
  }

  const configFormato = {
    a4: {
      maxProductosPorCartel: 22,
      bodyClass: "formato-a4",
      descripcion: "Hoja A4 completa",
    },
    "media-a4": {
      maxProductosPorCartel: 8,
      bodyClass: "formato-media-a4",
      descripcion: "Media hoja A4",
    },
  };

  const config = configFormato[formato] || configFormato.a4;

  const chunkArray = (array, size) => {
    const resultado = [];
    for (let index = 0; index < array.length; index += size) {
      resultado.push(array.slice(index, index + size));
    }
    return resultado;
  };

  const agruparProductos = (lista) => {
    const grupos = {};

    lista.forEach((producto) => {
      const categoria = (producto.categoria || "Sin clasificar").trim();
      const subcategoria = (producto.subcategoria || SIN_SUBCATEGORIA).trim();
      const key = `${categoria}|||${subcategoria}`;

      if (!grupos[key]) {
        grupos[key] = {
          categoria,
          subcategoria,
          items: [],
        };
      }

      grupos[key].items.push(producto);
    });

    return Object.values(grupos);
  };

  const formatearPrecio = (valor) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  const escaparHtml = (texto) =>
    String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const crearFilas = (items) =>
    items
      .map(
        (producto) => `
          <tr>
            <td>${escaparHtml(producto.codigo)}</td>
            <td>${escaparHtml(producto.nombre || producto.descripcion || "")}</td>
            <td>${formatearPrecio(producto.precio)}</td>
          </tr>
        `
      )
      .join("");

  const gruposBase = agruparProductos(productos);

  const gruposPaginados = gruposBase.flatMap((grupo) => {
    const itemsOrdenados = [...grupo.items].sort((a, b) => {
      const nombreA = (a.nombre || a.descripcion || "").trim();
      const nombreB = (b.nombre || b.descripcion || "").trim();
      return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
    });

    const bloques = chunkArray(itemsOrdenados, config.maxProductosPorCartel);

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
        <div class="print-toolbar no-print">
          <div class="print-toolbar-copy">
            <strong>Vista previa de impresión</strong>
            <span>${productos.length} producto(s), ${gruposPaginados.length} cartel(es), ${config.descripcion}</span>
          </div>

          <div class="print-toolbar-actions">
            <button type="button" class="print-toolbar-button print-toolbar-button-secondary" data-action="close">
              Cerrar
            </button>
            <button type="button" class="print-toolbar-button" data-action="print">
              Imprimir ahora
            </button>
          </div>
        </div>

        <div class="print-helper no-print">
          Revisá la vista previa antes de imprimir. En el cuadro de impresión conviene usar escala al 100% y márgenes predeterminados o mínimos.
        </div>

        ${gruposPaginados
          .map(
            (grupo) => `
              <section class="cartel">
                <div class="cartel-header">
                  ${
                    grupo.subcategoria && grupo.subcategoria !== SIN_SUBCATEGORIA
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

        <script>
          (() => {
            const printButton = document.querySelector('[data-action="print"]');
            const closeButton = document.querySelector('[data-action="close"]');

            printButton?.addEventListener("click", () => window.print());
            closeButton?.addEventListener("click", () => window.close());

            window.addEventListener("keydown", (event) => {
              const key = event.key.toLowerCase();

              if ((event.ctrlKey || event.metaKey) && key === "p") {
                event.preventDefault();
                window.print();
              }

              if (key === "escape") {
                window.close();
              }
            });
          })();
        </script>
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank");

  if (!ventana) {
    alert(
      "No se pudo abrir la vista de impresión. Revisá si el navegador está bloqueando popups."
    );
    return;
  }

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
}
