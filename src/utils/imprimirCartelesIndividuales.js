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
            <span>${productos.length} producto(s), ${carteles.length} cartel(es) individuales, ${config.descripcion}</span>
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
          Podes editar el titulo y la linea secundaria de cada cartel. El precio se recalcula con descuento para que el diseño individual quede listo para mostrador.
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

        ${carteles
          .map(({ producto, numeroCartel, totalCarteles }, index) => {
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

                <section class="cartel cartel--individual" data-cartel="${index}">
                  <div class="cartel-individual-layout">
                    <div class="cartel-individual-hero">
                      <div class="cartel-individual-kicker-wrap">
                        <span class="cartel-individual-kicker">Codigo ${escaparHtml(
                          producto.codigo
                        )}</span>
                        ${
                          totalCarteles > 1
                            ? `<span class="cartel-individual-secuencia">${numeroCartel} / ${totalCarteles}</span>`
                            : ""
                        }
                      </div>

                      <div class="cartel-individual-copy">
                        <p
                          class="cartel-individual-category${
                            categoriaInicial ? "" : " categoria-oculta"
                          }"
                          data-category-display
                          data-cartel-index="${index}"
                        >
                          ${escaparHtml(categoriaInicial)}
                        </p>
                        <h1 class="cartel-individual-title" data-title-display data-cartel-index="${index}">
                          ${escaparHtml(tituloInicial)}
                        </h1>
                      </div>

                      ${
                        producto.imagenUrl
                          ? `
                            <div class="cartel-individual-image">
                              <img src="${escaparHtml(producto.imagenUrl)}" alt="${escaparHtml(
                              tituloInicial
                            )}" />
                            </div>
                          `
                          : `
                            <div class="cartel-individual-image cartel-individual-image--placeholder" aria-hidden="true">
                              <span>${escaparHtml((tituloInicial || "P").slice(0, 1))}</span>
                            </div>
                          `
                      }
                    </div>

                    <div class="cartel-individual-price-grid">
                      <article class="cartel-individual-price-card" data-price-cell data-base-price="${Number(
                        producto.precio || 0
                      )}">
                        <span class="cartel-individual-price-label">Precio</span>
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
                              <div class="precio-stack precio-stack--individual">
                                <span class="precio-anterior oculto" data-original-rod-price></span>
                                <strong class="cartel-individual-price-value" data-current-rod-price>${formatearPrecio(
                                  Number(producto.precio || 0) * LARGO_VARILLA
                                )}</strong>
                              </div>
                            </article>
                          `
                          : ""
                      }
                    </div>
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

            const getTitleSize = (texto) => (${obtenerTamanioTitulo.toString()})(texto, formato);
            const getCategorySize = (texto) => (${obtenerTamanioCategoria.toString()})(texto, formato);

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

              titleDisplay.textContent = titulo;
              titleDisplay.style.fontSize = getTitleSize(titulo) + "mm";

              categoryDisplay.textContent = categoria;
              categoryDisplay.style.fontSize = getCategorySize(categoria) + "mm";
              categoryDisplay.classList.toggle("categoria-oculta", !categoria);
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
              input.addEventListener("input", () => syncCartel(input.dataset.cartelIndex));
            });

            categoryInputs.forEach((input) => {
              input.addEventListener("input", () => syncCartel(input.dataset.cartelIndex));
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
