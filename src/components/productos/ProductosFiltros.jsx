import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function ProductosFiltros({
  busqueda,
  categoriaSeleccionada,
  subcategoriaSeleccionada,
  categorias,
  subcategoriasDisponibles,
  onBusquedaChange,
  onCategoriaChange,
  onSubcategoriaChange,
}) {
  const recognitionRef = useRef(null);
  const [escuchandoVoz, setEscuchandoVoz] = useState(false);

  const SpeechRecognitionApi = useMemo(() => {
    if (typeof window === "undefined") return null;

    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  function toggleBusquedaPorVoz() {
    if (!SpeechRecognitionApi) {
      toast.info("La busqueda por voz no esta disponible en este navegador.");
      return;
    }

    if (escuchandoVoz && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognitionRef.current = recognition;
    recognition.lang = "es-AR";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setEscuchandoVoz(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      onBusquedaChange(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;

      const mensajes = {
        "not-allowed": "No se permitio usar el microfono.",
        "service-not-allowed":
          "La busqueda por voz esta bloqueada en este navegador.",
        "no-speech": "No se detecto voz. Proba de nuevo.",
        "audio-capture": "No se encontro un microfono disponible.",
      };

      toast.error(
        mensajes[event.error] || "No se pudo completar la busqueda por voz."
      );
    };

    recognition.onend = () => {
      setEscuchandoVoz(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }

  return (
    <div className="productos-filtros">
      <div className="productos-busqueda-wrap">
        <div className="productos-busqueda-input-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o codigo..."
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
          />
        </div>

        <button
          type="button"
          className={`busqueda-voz-btn${escuchandoVoz ? " busqueda-voz-btn--active" : ""}`}
          onClick={toggleBusquedaPorVoz}
          disabled={!SpeechRecognitionApi}
          aria-label={escuchandoVoz ? "Detener busqueda por voz" : "Buscar por voz"}
          title={
            !SpeechRecognitionApi
              ? "La busqueda por voz no esta disponible en este navegador"
              : escuchandoVoz
                ? "Detener busqueda por voz"
                : "Buscar por voz"
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm0 0v4m-4-4a4 4 0 0 0 8 0m-8 0H6m10 0h2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{escuchandoVoz ? "Escuchando" : "Voz"}</span>
        </button>
      </div>

      <select value={categoriaSeleccionada} onChange={onCategoriaChange}>
        <option value="">Todas las categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </select>

      <select
        value={subcategoriaSeleccionada}
        onChange={(event) => onSubcategoriaChange(event.target.value)}
        disabled={!categoriaSeleccionada}
      >
        <option value="">Todas las subcategorias</option>
        {subcategoriasDisponibles.map((subcategoria) => (
          <option key={subcategoria} value={subcategoria}>
            {subcategoria}
          </option>
        ))}
      </select>
    </div>
  );
}
