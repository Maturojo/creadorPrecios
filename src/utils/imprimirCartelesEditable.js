import cartelPrintCssUrl from "../styles/carteles-preview-print.css?url";

const SIN_SUBCATEGORIA = "Sin subcategoria";
const SIN_TITULO = "Sin titulo";

function normalizarTexto(valor, fallback = "") {
  return String(valor || "").trim() || fallback;
}

function escaparHtml(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obtenerTamanioTitulo(texto, formato) {
  const largo = normalizarTexto(texto).length;

  if (formato === "media-a4") {
    if (largo > 42) return 6.8;
    if (largo > 30) return 7.8;
    if (largo > 22) return 8.8;
    return 10;
  }

  if (largo > 42) return 11;
  if (largo > 30) return 12.5;
  if (largo > 22) return 14;
  return 16;
}

function obtenerTamanioCategoria(texto, formato) {
  const largo = normalizarTexto(texto).length;

  if (formato === "media-a4") {
    if (largo > 34) return 2.8;
    if (largo > 24) return 3.2;
    return 4;
  }

  if (largo > 34) return 4.2;
  if (largo > 24) return 4.8;
  return 5.5;
}

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
    for (let indice = 0; indice < array.length; indice += size) {
      resultado.push(array.slice(indice, indice + size));
    }
    return resultado;
  };

  const agruparProductos = (lista) => {
    const grupos = {};

    lista.forEach((producto) => {
      const categoria = normalizarTexto(producto.categoria, "Sin clasificar");
      const subcategoria = normalizarTexto(
        producto.subcategoria,
        SIN_SUBCATEGORIA
      );
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
      const nombreA = normalizarTexto(a.nombre || a.descripcion);
      const nombreB = normalizarTexto(b.nombre || b.descripcion);
      return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
    });

    return chunkArray(itemsOrdenados, config.maxProductosPorCartel).map(
      (bloque, index) => ({
        categoria: grupo.categoria,
        subcategoria: grupo.subcategoria,
        items: bloque,
        numeroCartel: index + 1,
        totalCarteles: Math.ceil(
          itemsOrdenados.length / config.maxProductosPorCartel
        ),
      })
    );
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
            <strong>Vista previa de impresion</strong>
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
          Podes editar el titulo y la categoria de cada cartel antes de imprimir. El encabezado se reajusta solo para evitar que el texto quede encimado.
        </div>

        ${gruposPaginados
          .map((grupo, index) => {
            const tituloInicial =
              grupo.subcategoria && grupo.subcategoria !== SIN_SUBCATEGORIA
                ? grupo.subcategoria
                : grupo.categoria;
            const categoriaInicial =
              grupo.subcategoria && grupo.subcategoria !== SIN_SUBCATEGORIA
                ? grupo.categoria
                : "";
            const mostrarCategoria = Boolean(categoriaInicial);

            return `
              <section class="cartel-shell" data-cartel-shell>
                <div class="cartel-editor no-print">
                  <div class="cartel-editor-grid">
                    <label class="cartel-editor-field">
                      <span>Titulo</span>
                      <input
                        type="text"
                        value="${escaparHtml(tituloInicial)}"
                        data-title-input
                        data-default-value="${escaparHtml(tituloInicial)}"
                        data-cartel-index="${index}"
                      />
                    </label>

                    <label class="cartel-editor-field">
                      <span>Categoria</span>
                      <input
                        type="text"
                        value="${escaparHtml(categoriaInicial)}"
                        data-category-input
                        data-default-value="${escaparHtml(categoriaInicial)}"
                        data-cartel-index="${index}"
                        placeholder="Opcional"
                      />
                    </label>

                    <button
                      type="button"
                      class="cartel-editor-reset"
                      data-reset-button
                      data-cartel-index="${index}"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>

                <section class="cartel" data-cartel="${index}">
                  <div class="cartel-header">
                    <div class="cartel-header-main">
                      <h1
                        class="subcategoria${mostrarCategoria ? "" : " solo-categoria"}"
                        data-title-display
                        data-cartel-index="${index}"
                      >
                        ${escaparHtml(tituloInicial)}
                      </h1>
                      <h2
                        class="categoria${mostrarCategoria ? "" : " categoria-oculta"}"
                        data-category-display
                        data-cartel-index="${index}"
                      >
                        ${escaparHtml(categoriaInicial)}
                      </h2>
                    </div>

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
                          <th>Cod.</th>
                          <th>Descripcion</th>
                          <th>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${crearFilas(grupo.items)}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>
            `;
          })
          .join("")}

        <script>
          (() => {
            const body = document.body;
            const formato = body.classList.contains("formato-media-a4")
              ? "media-a4"
              : "a4";
            const printButton = document.querySelector('[data-action="print"]');
            const closeButton = document.querySelector('[data-action="close"]');
            const titleInputs = document.querySelectorAll("[data-title-input]");
            const categoryInputs = document.querySelectorAll("[data-category-input]");
            const resetButtons = document.querySelectorAll("[data-reset-button]");

            const getTitleSize = (texto) => {
              const largo = (texto || "").trim().length;

              if (formato === "media-a4") {
                if (largo > 42) return 6.8;
                if (largo > 30) return 7.8;
                if (largo > 22) return 8.8;
                return 10;
              }

              if (largo > 42) return 11;
              if (largo > 30) return 12.5;
              if (largo > 22) return 14;
              return 16;
            };

            const getCategorySize = (texto) => {
              const largo = (texto || "").trim().length;

              if (formato === "media-a4") {
                if (largo > 34) return 2.8;
                if (largo > 24) return 3.2;
                return 4;
              }

              if (largo > 34) return 4.2;
              if (largo > 24) return 4.8;
              return 5.5;
            };

            const syncCartel = (index) => {
              const titleInput = document.querySelector('[data-title-input][data-cartel-index="' + index + '"]');
              const categoryInput = document.querySelector('[data-category-input][data-cartel-index="' + index + '"]');
              const titleDisplay = document.querySelector('[data-title-display][data-cartel-index="' + index + '"]');
              const categoryDisplay = document.querySelector('[data-category-display][data-cartel-index="' + index + '"]');

              if (!titleInput || !categoryInput || !titleDisplay || !categoryDisplay) {
                return;
              }

              const titulo = titleInput.value.trim() || "${SIN_TITULO}";
              const categoria = categoryInput.value.trim();
              const mostrarCategoria = Boolean(categoria);

              titleDisplay.textContent = titulo;
              titleDisplay.style.fontSize = getTitleSize(titulo) + "mm";
              titleDisplay.classList.toggle("solo-categoria", !mostrarCategoria);

              categoryDisplay.textContent = categoria;
              categoryDisplay.style.fontSize = getCategorySize(categoria) + "mm";
              categoryDisplay.classList.toggle("categoria-oculta", !mostrarCategoria);
            };

            titleInputs.forEach((input) => {
              input.addEventListener("input", () => {
                syncCartel(input.dataset.cartelIndex);
              });
            });

            categoryInputs.forEach((input) => {
              input.addEventListener("input", () => {
                syncCartel(input.dataset.cartelIndex);
              });
            });

            resetButtons.forEach((button) => {
              button.addEventListener("click", () => {
                const index = button.dataset.cartelIndex;
                const titleInput = document.querySelector('[data-title-input][data-cartel-index="' + index + '"]');
                const categoryInput = document.querySelector('[data-category-input][data-cartel-index="' + index + '"]');

                if (titleInput) {
                  titleInput.value = titleInput.dataset.defaultValue || "";
                }

                if (categoryInput) {
                  categoryInput.value = categoryInput.dataset.defaultValue || "";
                }

                syncCartel(index);
              });
            });

            titleInputs.forEach((input) => syncCartel(input.dataset.cartelIndex));

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
      "No se pudo abrir la vista de impresion. Revisa si el navegador esta bloqueando popups."
    );
    return;
  }

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
}
