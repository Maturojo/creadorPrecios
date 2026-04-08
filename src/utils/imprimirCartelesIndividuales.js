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
    if (largo > 44) return 7.4;
    if (largo > 32) return 8.2;
    if (largo > 24) return 9.2;
    return 10.4;
  }

  if (largo > 44) return 12.2;
  if (largo > 32) return 13.8;
  if (largo > 24) return 15.2;
  return 17.2;
}

function obtenerTamanioCategoria(texto, formato) {
  const largo = normalizarTexto(texto).length;

  if (formato === "media-a4") {
    if (largo > 36) return 2.7;
    if (largo > 24) return 3.1;
    return 3.5;
  }

  if (largo > 36) return 4;
  if (largo > 24) return 4.4;
  return 4.8;
}

function obtenerTamanioTituloBase(formato) {
  return 7;
}

export function imprimirCartelesIndividuales(productos, opciones) {
  const configFormato = {
    a4: {
      bodyClass: "formato-a4",
      descripcion: "Hoja A4 completa",
    },
    "media-a4": {
      bodyClass: "formato-media-a4",
      descripcion: "Media hoja A4",
    },
  };

  const config = configFormato[opciones.formato] || configFormato.a4;

  const formatearPrecio = (valor) =>
    `$${Number(valor || 0).toLocaleString("es-AR")}`;

  const carteles = [...productos]
    .sort((a, b) => {
      const nombreA = normalizarTexto(a.nombre || a.descripcion);
      const nombreB = normalizarTexto(b.nombre || b.descripcion);
      return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
    })
    .map((producto, index, lista) => ({
      producto,
      numeroCartel: index + 1,
      totalCarteles: lista.length,
    }));

  const cartelesPorPagina = opciones.formato === "media-a4" ? 4 : 8;
  const paginas = [];

  for (let indice = 0; indice < carteles.length; indice += cartelesPorPagina) {
    paginas.push(carteles.slice(indice, indice + cartelesPorPagina));
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Carteles individuales</title>
        <link rel="stylesheet" href="${cartelPrintCssUrl}" />
      </head>
      <body class="${config.bodyClass} modo-individual">
        <div class="print-toolbar no-print">
          <div class="print-toolbar-copy">
            <strong>Vista previa de impresion</strong>
            <span>${productos.length} producto(s), ${carteles.length} cartel(es) individuales, ${paginas.length} hoja(s), ${config.descripcion}</span>
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
          Podes ajustar el tamaño del titulo y editar la linea secundaria de cada cartel. El nombre del producto se mantiene fijo.
        </div>

        <div class="print-controls no-print">
          <div class="print-controls-grid">
            <label class="cartel-editor-field">
              <span>Descuento para el cartel</span>
              <div class="print-input-with-suffix">
                <input type="number" min="0" max="99" step="1" value="0" data-discount-input />
                <strong>%</strong>
              </div>
            </label>

            <label class="print-check">
              <input type="checkbox" data-show-original-toggle />
              <span>Mostrar precio anterior tachado</span>
            </label>
          </div>
        </div>

        <section class="cartel-editor-list no-print">
        ${carteles
          .map(({ producto, numeroCartel, totalCarteles }, index) => {
            const tituloInicial = normalizarTexto(
              producto.nombre || producto.descripcion,
              SIN_TITULO
            );
            const tamanioTituloInicial = obtenerTamanioTituloBase(opciones.formato);
            const categoriaInicial = [
              normalizarTexto(producto.categoria, ""),
              normalizarTexto(producto.subcategoria, SIN_SUBCATEGORIA) !==
              SIN_SUBCATEGORIA
                ? normalizarTexto(producto.subcategoria, "")
                : "",
            ]
              .filter(Boolean)
              .join(" · ");

            return `
              <div class="cartel-editor">
                <div class="cartel-editor-grid">
                  <label class="cartel-editor-field">
                    <span>Tamaño del titulo</span>
                    <div class="print-input-with-suffix">
                      <input
                        type="number"
                        min="1.6"
                        max="14"
                        step="0.1"
                        value="${tamanioTituloInicial}"
                        data-title-size-input
                        data-default-value="${tamanioTituloInicial}"
                        data-cartel-index="${index}"
                      />
                      <strong>mm</strong>
                    </div>
                  </label>

                  <label class="cartel-editor-field">
                    <span>Producto</span>
                    <input
                      type="text"
                      value="${escaparHtml(tituloInicial)}"
                      disabled
                      class="cartel-editor-readonly"
                      data-cartel-index="${index}"
                    />
                  </label>

                  <label class="cartel-editor-field">
                    <span>Linea secundaria</span>
                    <input
                      type="text"
                      value="${escaparHtml(categoriaInicial)}"
                      data-category-input
                      data-default-value="${escaparHtml(categoriaInicial)}"
                      data-cartel-index="${index}"
                      placeholder="Opcional"
                    />
                  </label>

                  <button type="button" class="cartel-editor-reset" data-reset-button data-cartel-index="${index}">
                    Restaurar
                  </button>
                </div>
              </div>
            `;
          })
          .join("")}
        </section>

        <section class="individual-pages">
        ${paginas
          .map(
            (pagina, paginaIndex) => `
              <section class="individual-page">
                ${pagina
                  .map(({ producto, numeroCartel, totalCarteles }) => {
                    const index = numeroCartel - 1;
                    const tituloInicial = normalizarTexto(
                      producto.nombre || producto.descripcion,
                      SIN_TITULO
                    );
                    const categoriaInicial = [
                      normalizarTexto(producto.categoria, ""),
                      normalizarTexto(producto.subcategoria, SIN_SUBCATEGORIA) !==
                      SIN_SUBCATEGORIA
                        ? normalizarTexto(producto.subcategoria, "")
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    return `
                      <section class="cartel cartel--individual" data-cartel="${index}" data-page-index="${paginaIndex}">
                        <div class="cartel-individual-stage">
                          <article class="cartel-individual-label">
                              <div class="cartel-individual-topline">
                                <span class="cartel-individual-kicker">Cod. ${escaparHtml(
                                  producto.codigo
                                )}</span>
                              </div>

                            <div class="cartel-individual-copy">
                              <h1 class="cartel-individual-title" data-title-display data-cartel-index="${index}">
                                ${escaparHtml(tituloInicial)}
                              </h1>
                              <p
                                class="cartel-individual-category${
                                  categoriaInicial ? "" : " categoria-oculta"
                                }"
                                data-category-display
                                data-cartel-index="${index}"
                              >
                                ${escaparHtml(categoriaInicial)}
                              </p>
                            </div>

                            <div class="cartel-individual-divider"></div>

                            <div class="cartel-individual-price-stack">
                              <article class="cartel-individual-price-card cartel-individual-price-card--main" data-price-cell data-base-price="${Number(
                                producto.precio || 0
                              )}">
                                <div class="precio-stack precio-stack--individual">
                                  <span class="precio-anterior oculto" data-original-price></span>
                                  <strong class="cartel-individual-price-value" data-current-price>${formatearPrecio(
                                    producto.precio
                                  )}</strong>
                                </div>
                              </article>

                              ${
                                esProductoVarilla(producto)
                                  ? `
                                    <article
                                      class="cartel-individual-price-card cartel-individual-price-card--secondary"
                                      data-rod-price-cell
                                      data-base-price="${Number(producto.precio || 0)}"
                                      data-aplica-varilla="true"
                                    >
                                      <span class="cartel-individual-price-label">Varilla ${LARGO_VARILLA.toFixed(
                                        2
                                      )} m</span>
                                      <div class="precio-stack precio-stack--individual precio-stack--secondary">
                                        <span class="precio-anterior oculto" data-original-rod-price></span>
                                        <strong class="cartel-individual-price-value cartel-individual-price-value--secondary" data-current-rod-price>${formatearPrecio(
                                          Number(producto.precio || 0) * LARGO_VARILLA
                                        )}</strong>
                                      </div>
                                    </article>
                                  `
                                  : ""
                              }
                            </div>
                          </article>
                        </div>
                      </section>
                    `;
                  })
                  .join("")}
              </section>
            `
          )
          .join("")}
        </section>

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
            const titleSizeInputs = document.querySelectorAll("[data-title-size-input]");
            const categoryInputs = document.querySelectorAll("[data-category-input]");
            const resetButtons = document.querySelectorAll("[data-reset-button]");

            const normalizarTexto = (valor) => String(valor || "").trim();

            const cerrarVentana = () => {
              try {
                window.open("", "_self");
                window.close();
              } catch (error) {
                console.error("No se pudo cerrar la ventana", error);
              }
            };

            const imprimirVentana = () => {
              window.focus();
              window.print();
            };

            const getCategorySize = (texto) => {
              const largo = normalizarTexto(texto).length;

              if (formato === "media-a4") {
                if (largo > 36) return 2.7;
                if (largo > 24) return 3.1;
                return 3.5;
              }

              if (largo > 36) return 4;
              if (largo > 24) return 4.4;
              return 4.8;
            };

            const ajustarTituloParaEntrar = (titleDisplay, categoryDisplay, tamanioBase) => {
              const copy = titleDisplay?.closest(".cartel-individual-copy");

              if (!copy || !titleDisplay) {
                return tamanioBase;
              }

              const minSize = 2.4;
              let tamanioAjustado = tamanioBase;

              titleDisplay.style.fontSize = tamanioAjustado + "mm";

              const obtenerEspacioDisponible = () => {
                const estilosCopy = window.getComputedStyle(copy);
                const gap = parseFloat(estilosCopy.rowGap || estilosCopy.gap || "0");
                const paddingTop = parseFloat(estilosCopy.paddingTop || "0");
                const paddingBottom = parseFloat(estilosCopy.paddingBottom || "0");
                const categoriaVisible = categoryDisplay && !categoryDisplay.classList.contains("categoria-oculta");
                const alturaCategoria = categoriaVisible ? categoryDisplay.offsetHeight : 0;
                const gapCategoria = categoriaVisible ? gap : 0;

                return copy.clientHeight - paddingTop - paddingBottom - alturaCategoria - gapCategoria;
              };

              let espacioDisponible = obtenerEspacioDisponible();

              while (titleDisplay.scrollHeight > espacioDisponible + 1 && tamanioAjustado > minSize) {
                tamanioAjustado = Number((tamanioAjustado - 0.2).toFixed(1));
                titleDisplay.style.fontSize = tamanioAjustado + "mm";
                espacioDisponible = obtenerEspacioDisponible();
              }

              return tamanioAjustado;
            };

            const syncCartel = (index) => {
              const titleSizeInput = document.querySelector('[data-title-size-input][data-cartel-index="' + index + '"]');
              const categoryInput = document.querySelector('[data-category-input][data-cartel-index="' + index + '"]');
              const titleDisplay = document.querySelector('[data-title-display][data-cartel-index="' + index + '"]');
              const categoryDisplay = document.querySelector('[data-category-display][data-cartel-index="' + index + '"]');

              if (!titleSizeInput || !categoryInput || !titleDisplay || !categoryDisplay) {
                return;
              }

              const titulo = titleDisplay.textContent?.trim() || "${SIN_TITULO}";
              const categoria = categoryInput.value.trim();
              const tamanioManual = Number(titleSizeInput.value || titleSizeInput.dataset.defaultValue || 0);
              const tamanioNormalizado = Math.min(Math.max(tamanioManual, 1.6), 14);

              titleDisplay.textContent = titulo;
              categoryDisplay.textContent = categoria;
              categoryDisplay.style.fontSize = getCategorySize(categoria) + "mm";
              categoryDisplay.classList.toggle("categoria-oculta", !categoria);
              ajustarTituloParaEntrar(titleDisplay, categoryDisplay, tamanioNormalizado);
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

            titleSizeInputs.forEach((input) => {
              input.addEventListener("input", () => syncCartel(input.dataset.cartelIndex));
            });

            categoryInputs.forEach((input) => {
              input.addEventListener("input", () => syncCartel(input.dataset.cartelIndex));
            });

            resetButtons.forEach((button) => {
              button.addEventListener("click", () => {
                const index = button.dataset.cartelIndex;
                const titleSizeInput = document.querySelector('[data-title-size-input][data-cartel-index="' + index + '"]');
                const categoryInput = document.querySelector('[data-category-input][data-cartel-index="' + index + '"]');

                if (titleSizeInput) {
                  titleSizeInput.value = titleSizeInput.dataset.defaultValue || "";
                }

                if (categoryInput) {
                  categoryInput.value = categoryInput.dataset.defaultValue || "";
                }

                syncCartel(index);
              });
            });

            titleSizeInputs.forEach((input) => syncCartel(input.dataset.cartelIndex));
            discountInput?.addEventListener("input", syncPrices);
            showOriginalToggle?.addEventListener("change", syncPrices);
            syncPrices();

            printButton?.addEventListener("click", imprimirVentana);
            closeButton?.addEventListener("click", cerrarVentana);

            window.addEventListener("keydown", (event) => {
              const key = event.key.toLowerCase();

              if ((event.ctrlKey || event.metaKey) && key === "p") {
                event.preventDefault();
                imprimirVentana();
              }

              if (key === "escape") {
                cerrarVentana();
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
