import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:3001";

function GestorExcepciones({ onActualizado }) {
  const [productos, setProductos] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [productoId, setProductoId] = useState("");
  const [reglaId, setReglaId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function leerRespuestaComoJson(res) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`El servidor no devolvió JSON válido. Respuesta: ${text}`);
    }
  }

  async function cargarDatos() {
    try {
      const [resProductos, resReglas] = await Promise.all([
        fetch(`${API}/api/productos`),
        fetch(`${API}/api/reglas-prefijo`),
      ]);

      const dataProductos = await leerRespuestaComoJson(resProductos);
      const dataReglas = await leerRespuestaComoJson(resReglas);

      if (!resProductos.ok) {
        throw new Error(dataProductos.error || "Error cargando productos");
      }

      if (!resReglas.ok) {
        throw new Error(dataReglas.error || "Error cargando reglas");
      }

      setProductos(Array.isArray(dataProductos) ? dataProductos : []);
      setReglas(Array.isArray(dataReglas) ? dataReglas : []);
    } catch (error) {
      console.error("Error cargando datos de excepciones:", error);
      alert(error.message || "Error cargando datos");
    }
  }

  function resetSeleccion() {
    setProductoId("");
    setReglaId("");
    setBusqueda("");
  }

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return productos.filter((p) => {
      if (!texto) return true;

      const nombre = String(p.nombre || "").toLowerCase();
      const codigo = String(p.codigo || "").toLowerCase();

      return nombre.includes(texto) || codigo.includes(texto);
    });
  }, [productos, busqueda]);

  async function reaplicarTodo() {
    const res = await fetch(`${API}/api/reglas-prefijo/reaplicar`, {
      method: "POST",
    });

    const data = await leerRespuestaComoJson(res);

    if (!res.ok) {
      throw new Error(data.error || "Error al reaplicar reglas");
    }

    if (onActualizado) {
      await onActualizado();
    }

    await cargarDatos();
  }

  async function incluirProducto() {
    if (!productoId || !reglaId) {
      alert("Elegí una regla y un producto");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reglas-prefijo/${reglaId}/incluir-producto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productoId }),
      });

      const data = await leerRespuestaComoJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Error al incluir producto");
      }

      await reaplicarTodo();
      resetSeleccion();
      alert("Producto incluido manualmente");
    } catch (error) {
      console.error("Error incluyendo producto:", error);
      alert(error.message || "Error al incluir producto");
    } finally {
      setLoading(false);
    }
  }

  async function excluirProducto() {
    if (!productoId || !reglaId) {
      alert("Elegí una regla y un producto");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reglas-prefijo/${reglaId}/excluir-producto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productoId }),
      });

      const data = await leerRespuestaComoJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Error al excluir producto");
      }

      await reaplicarTodo();
      resetSeleccion();
      alert("Producto excluido manualmente");
    } catch (error) {
      console.error("Error excluyendo producto:", error);
      alert(error.message || "Error al excluir producto");
    } finally {
      setLoading(false);
    }
  }

  async function quitarExcepcion() {
    if (!productoId || !reglaId) {
      alert("Elegí una regla y un producto");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reglas-prefijo/${reglaId}/quitar-excepcion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productoId }),
      });

      const data = await leerRespuestaComoJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Error al quitar excepción");
      }

      await reaplicarTodo();
      resetSeleccion();
      alert("Excepción eliminada");
    } catch (error) {
      console.error("Error quitando excepción:", error);
      alert(error.message || "Error al quitar excepción");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2>Excepciones Manuales por Regla</h2>

      <div style={{ marginBottom: "12px" }}>
        <label>Buscar producto: </label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre o código"
          disabled={loading}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>Elegir producto: </label>
        <select
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          disabled={loading}
        >
          <option value="">Seleccionar producto</option>
          {productosFiltrados.map((producto) => (
            <option key={producto._id} value={producto._id}>
              {producto.codigo} - {producto.nombre} [{producto.familia}]
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>Elegir regla: </label>
        <select
          value={reglaId}
          onChange={(e) => setReglaId(e.target.value)}
          disabled={loading}
        >
          <option value="">Seleccionar regla</option>
          {reglas.map((regla) => (
            <option key={regla._id} value={regla._id}>
              {regla.prefijo} → {regla.familia}
              {regla.subfamilia ? ` / ${regla.subfamilia}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={incluirProducto} disabled={loading || !productoId || !reglaId}>
          Incluir manualmente
        </button>

        <button onClick={excluirProducto} disabled={loading || !productoId || !reglaId}>
          Excluir manualmente
        </button>

        <button onClick={quitarExcepcion} disabled={loading || !productoId || !reglaId}>
          Quitar excepción
        </button>
      </div>
    </div>
  );
}

export default GestorExcepciones;