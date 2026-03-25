import { useEffect, useMemo, useState } from "react";
import Cartel from "./components/Cartel";
import ReglasPrefijo from "./components/ReglasPrefijo";

const API = "http://localhost:3001";

function App() {
  const [productos, setProductos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setLoading(true);
    setError("");

    try {
      const [resProductos, resFamilias] = await Promise.all([
        fetch(`${API}/api/productos`),
        fetch(`${API}/api/familias`),
      ]);

      const dataProductos = await resProductos.json();
      const dataFamilias = await resFamilias.json();

      if (!resProductos.ok) {
        throw new Error(dataProductos.error || "Error cargando productos");
      }

      if (!resFamilias.ok) {
        throw new Error(dataFamilias.error || "Error cargando familias");
      }

      setProductos(Array.isArray(dataProductos) ? dataProductos : []);
      setFamilias(Array.isArray(dataFamilias) ? dataFamilias : []);
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError(err.message || "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const nombre = String(producto.nombre || "").toLowerCase();
      const codigo = String(producto.codigo || producto.barras || "").toLowerCase();
      const textoBusqueda = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !textoBusqueda ||
        nombre.includes(textoBusqueda) ||
        codigo.includes(textoBusqueda);

      const coincideFamilia =
        familiaSeleccionada === "TODAS" ||
        String(producto.familia || "SIN CLASIFICAR") === familiaSeleccionada;

      return coincideBusqueda && coincideFamilia;
    });
  }, [productos, busqueda, familiaSeleccionada]);

  async function handleCargaCompleta(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    try {
      const XLSX = await import("xlsx");
      const data = await archivo.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const res = await fetch(`${API}/api/productos/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "total",
          datos: json,
        }),
      });

      const resultado = await res.json();

      if (!res.ok) {
        throw new Error(resultado.error || "Error en la carga completa");
      }

      alert(`Carga completa realizada. Productos guardados: ${resultado.count}`);
      await cargarTodo();
      e.target.value = "";
    } catch (err) {
      console.error("Error en carga completa:", err);
      alert(err.message || "Error al cargar el archivo");
    }
  }

  async function handleActualizarFamilia(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    try {
      const XLSX = await import("xlsx");
      const data = await archivo.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const res = await fetch(`${API}/api/productos/actualizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          datos: json,
        }),
      });

      const resultado = await res.json();

      if (!res.ok) {
        throw new Error(resultado.error || "Error actualizando productos");
      }

      alert(
        `Actualización realizada. Creados: ${resultado.creados} | Actualizados: ${resultado.actualizados}`
      );

      await cargarTodo();
      e.target.value = "";
    } catch (err) {
      console.error("Error actualizando productos:", err);
      alert(err.message || "Error al actualizar el archivo");
    }
  }

  function imprimirCarteleria() {
    window.print();
  }

  return (
    <div style={{ padding: "24px" }}>
      <ReglasPrefijo onReglasChange={cargarTodo} />

      <h1>Sur Maderas - Gestor de Precios</h1>

      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>Conectado a MongoDB Atlas | {productos.length} productos</p>
      )}

      <div style={{ marginBottom: "12px" }}>
        <button onClick={imprimirCarteleria}>🖨️ IMPRIMIR CARTELERÍA</button>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>Carga Completa (Borra lo anterior): </label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleCargaCompleta} />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>Actualizar o Agregar Familia: </label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleActualizarFamilia} />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>Buscar producto (Nombre o Código): </label>
        <input
          type="text"
          placeholder="Ej: Mesa de pino, Pincel, AC1"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label>Filtrar por Familia: </label>
        <select
          value={familiaSeleccionada}
          onChange={(e) => setFamiliaSeleccionada(e.target.value)}
        >
          <option value="TODAS">TODAS</option>
          {familias.map((familia) => (
            <option key={familia} value={familia}>
              {familia}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : productosFiltrados.length === 0 ? (
        <p>No se encontraron productos para esta búsqueda...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(520px, 1fr))",
            gap: "16px",
          }}
        >
          {productosFiltrados.map((producto) => (
            <Cartel key={producto._id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;