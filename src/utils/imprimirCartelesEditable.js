import cartelPrintCssUrl from "../styles/carteles-preview-print.css?url";

const SIN_SUBCATEGORIA = "Sin subcategoria";
const SIN_TITULO = "Sin titulo";
const LARGO_VARILLA = 3.05;

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

function esProductoVarilla(producto) {
  const categoria = normalizarTexto(producto.categoria).toLowerCase();
  return categoria === "listoneria" || categoria === "molduras";
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

  const opciones =
    typeof formato === "string" ? { formato, agrupacion: "clasificacion" } : formato;

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

  const config = configFormato[opciones.formato] || configFormato.a4;
  const agrupacion = opciones.agrupacion || "clasificacion";

  const chunkArray = (array, size) => {
    const resultado = [];
    for (let indice = 0; indice < array.length; indice += size) {
      resultado.push(array.slice(indice, indice + size));
    }
    return resultado;
  };

  const obtenerEncabezadoMixto = (lista) => {
    const categoriasUnicas = [
      ...new Set(
        lista.map((producto) =>
          normalizarTexto(producto.categoria, "Sin clasificar")
        )
      ),
    ];
    const subcategoriasUnicas = [
      ...new Set(
        lista.map((producto) =>
          normalizarTexto(producto.subcategoria, SIN_SUBCATEGORIA)
        )
      ),
    ];

    const categoriaComun =
      categoriasUnicas.length === 1 ? categoriasUnicas[0] : "";
    const subcategoriaComun =
      subcategoriasUnicas.length === 1 ? subcategoriasUnicas[0] : "";

    if (
      categoriaComun &&
      subcategoriaComun &&
      subcategoriaComun !== SIN_SUBCATEGORIA
    ) {
      return {
        categoria: categoriaComun,
        subcategoria: subcategoriaComun,
      };
    }

    if (categoriaComun) {
      return {
        categoria: categoriaComun,
        subcategoria: SIN_SUBCATEGORIA,
      };
    }

    return {
      categoria: "",
      subcategoria: "Seleccion combinada",
    };
  };

  const agruparProductos = (lista) => {
    if (agrupacion === "mezclar") {
      return [
        {
          ...obtenerEncabezadoMixto(lista),
          items: lista,
        },
      ];
    }

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

  const crearFilas = (items, mostrarPrecioVarilla) =>
    items
      .map(
        (producto) => `
          <tr data-product-row>
            <td>${escaparHtml(producto.codigo)}</td>
            <td>${escaparHtml(producto.nombre || producto.descripcion || "")}</td>
            <td class="precio-celda" data-price-cell data-base-price="${Number(
              producto.precio || 0
            )}">
              <div class="precio-stack">
                <span class="precio-anterior oculto" data-original-price></span>
                <span class="precio-actual" data-current-price>${formatearPrecio(
                  producto.precio
                )}</span>
              </div>
            </td>
            ${
              mostrarPrecioVarilla
                ? `
                  <td
                    class="precio-celda precio-varilla-celda${
                      esProductoVarilla(producto) ? "" : " precio-varilla-no-aplica"
                    }"
                    data-rod-price-cell
                    data-base-price="${Number(producto.precio || 0)}"
                    data-aplica-varilla="${esProductoVarilla(producto) ? "true" : "false"}"
                  >
                    ${
                      esProductoVarilla(producto)
                        ? `
                          <div class="precio-stack">
                            <span class="precio-anterior oculto" data-original-rod-price></span>
                            <span class="precio-actual" data-current-rod-price>${formatearPrecio(
                              Number(producto.precio || 0) * LARGO_VARILLA
                            )}</span>
                          </div>
                        `
                        : `<span class="precio-no-aplica">-</span>`
                    }
                  </td>
                `
                : ""
            }
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
        tienePrecioVarilla: bloque.some((producto) => esProductoVarilla(producto)),
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
            <span>${productos.length} producto(s), ${gruposPaginados.length} cartel(es), ${config.descripcion}, ${
              agrupacion === "mezclar" ? "mezclando categorias" : "separando por clasificacion"
            }</span>
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

        <div class="print-controls no-print">
          <div class="print-controls-grid">
            <label class="cartel-editor-field">
              <span>Descuento para el cartel</span>
              <div class="print-input-with-suffix">
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="1"
                  value="0"
                  data-discount-input
                />
                <strong>%</strong>
              </div>
            </label>

            <label class="print-check">
              <input type="checkbox" data-show-original-toggle />
              <span>Mostrar precio anterior tachado</span>
            </label>
          </div>
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
                      ${
                        grupo.tienePrecioVarilla
                          ? `
                            <p class="cartel-note" data-rod-note>
                              Precio por varilla completa (${LARGO_VARILLA.toFixed(2)} m)
                            </p>
                          `
                          : ""
                      }
                    </div>

                    ${
                      grupo.totalCarteles > 1
                        ? `<div class="cartel-info">Cartel ${grupo.numeroCartel} de ${grupo.totalCarteles}</div>`
                        : ""
                    }
                  </div>

                  <div class="cartel-tabla-wrap">
                    <table class="cartel-tabla${
                      grupo.tienePrecioVarilla ? " cartel-tabla-con-varilla" : ""
                    }">
                      <thead>
                        <tr>
                          <th>Cod.</th>
                          <th>Descripcion</th>
                          <th>${
                            grupo.tienePrecioVarilla ? "Precio por metro" : "Precio"
                          }</th>
                          ${
                            grupo.tienePrecioVarilla
                              ? `<th>Precio varilla</th>`
                              : ""
                          }
                        </tr>
                      </thead>
                      <tbody>
                        ${crearFilas(grupo.items, grupo.tienePrecioVarilla)}
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
            const discountInput = document.querySelector("[data-discount-input]");
            const showOriginalToggle = document.querySelector("[data-show-original-toggle]");
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

            const formatPrice = (valor) =>
              new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 2,
              }).format(Number(valor || 0));

            const getDiscountMultiplier = () => {
              const descuento = Number(discountInput?.value || 0);
              const descuentoNormalizado = Math.min(Math.max(descuento, 0), 99);
              return 1 - descuentoNormalizado / 100;
            };

            const syncPrices = () => {
              const multiplier = getDiscountMultiplier();
              const mostrarAnterior = Boolean(showOriginalToggle?.checked);

              document.querySelectorAll("[data-price-cell]").forEach((cell) => {
                const basePrice = Number(cell.dataset.basePrice || 0);
                const currentPrice = cell.querySelector("[data-current-price]");
                const originalPrice = cell.querySelector("[data-original-price]");
                const discountedPrice = basePrice * multiplier;

                if (currentPrice) {
                  currentPrice.textContent = formatPrice(discountedPrice);
                }

                if (originalPrice) {
                  originalPrice.textContent = formatPrice(basePrice);
                  originalPrice.classList.toggle("oculto", !mostrarAnterior || multiplier === 1);
                }
              });

              document.querySelectorAll("[data-rod-price-cell]").forEach((cell) => {
                if (cell.dataset.aplicaVarilla !== "true") {
                  return;
                }

                const basePrice = Number(cell.dataset.basePrice || 0) * ${LARGO_VARILLA};
                const currentPrice = cell.querySelector("[data-current-rod-price]");
                const originalPrice = cell.querySelector("[data-original-rod-price]");
                const discountedPrice = basePrice * multiplier;

                if (currentPrice) {
                  currentPrice.textContent = formatPrice(discountedPrice);
                }

                if (originalPrice) {
                  originalPrice.textContent = formatPrice(basePrice);
                  originalPrice.classList.toggle("oculto", !mostrarAnterior || multiplier === 1);
                }
              });
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
            discountInput?.addEventListener("input", syncPrices);
            showOriginalToggle?.addEventListener("change", syncPrices);
            syncPrices();

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
