import { useEffect, useState } from "react";

const API = "http://localhost:3001";

function ReglasPrefijo({ onReglasChange }) {
  const [reglas, setReglas] = useState([]);
  const [form, setForm] = useState({
    prefijo: "",
    familia: "",
    subfamilia: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarReglas();
  }, []);

  async function cargarReglas() {
    try {
      const res = await fetch(`${API}/api/reglas-prefijo`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error cargando reglas");
      }

      setReglas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando reglas:", error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function guardarRegla(e) {
    e.preventDefault();

    if (!form.prefijo.trim() || !form.familia.trim()) {
      alert("Prefijo y familia son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reglas-prefijo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la regla");
      }

      const resReaplicar = await fetch(`${API}/api/reglas-prefijo/reaplicar`, {
        method: "POST",
      });

      const dataReaplicar = await resReaplicar.json();

      if (!resReaplicar.ok) {
        throw new Error(dataReaplicar.error || "Error al reaplicar reglas");
      }

      setForm({
        prefijo: "",
        familia: "",
        subfamilia: "",
        descripcion: "",
      });

      await cargarReglas();

      if (onReglasChange) {
        await onReglasChange();
      }

      alert("Regla guardada y productos actualizados correctamente");
    } catch (error) {
      console.error("Error guardando regla:", error);
      alert(error.message || "Error guardando regla");
    } finally {
      setLoading(false);
    }
  }

  async function eliminarRegla(id) {
    const ok = window.confirm("¿Eliminar esta regla?");
    if (!ok) return;

    setLoading(true);

    try {
      const resDelete = await fetch(`${API}/api/reglas-prefijo/${id}`, {
        method: "DELETE",
      });

      const dataDelete = await resDelete.json();

      if (!resDelete.ok) {
        throw new Error(dataDelete.error || "Error al eliminar la regla");
      }

      const resReaplicar = await fetch(`${API}/api/reglas-prefijo/reaplicar`, {
        method: "POST",
      });

      const dataReaplicar = await resReaplicar.json();

      if (!resReaplicar.ok) {
        throw new Error(dataReaplicar.error || "Error al reaplicar reglas");
      }

      await cargarReglas();

      if (onReglasChange) {
        await onReglasChange();
      }

      alert("Regla eliminada y productos actualizados correctamente");
    } catch (error) {
      console.error("Error eliminando regla:", error);
      alert(error.message || "Error eliminando regla");
    } finally {
      setLoading(false);
    }
  }

  async function reaplicarReglas() {
    const ok = window.confirm("¿Reaplicar reglas a todos los productos?");
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reglas-prefijo/reaplicar`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al reaplicar reglas");
      }

      await cargarReglas();

      if (onReglasChange) {
        await onReglasChange();
      }

      alert(`Productos actualizados: ${data.actualizados}`);
    } catch (error) {
      console.error("Error reaplicando reglas:", error);
      alert(error.message || "Error al reaplicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2>Reglas de Prefijos</h2>

      <form onSubmit={guardarRegla} style={{ marginBottom: "16px" }}>
        <input
          type="text"
          name="prefijo"
          placeholder="Prefijo (ej: AC)"
          value={form.prefijo}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          type="text"
          name="familia"
          placeholder="Familia"
          value={form.familia}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          type="text"
          name="subfamilia"
          placeholder="Subfamilia"
          value={form.subfamilia}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar regla"}
        </button>
      </form>

      <button onClick={reaplicarReglas} disabled={loading} style={{ marginBottom: "16px" }}>
        Reaplicar reglas a productos
      </button>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Prefijo</th>
            <th>Familia</th>
            <th>Subfamilia</th>
            <th>Descripción</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reglas.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No hay reglas cargadas
              </td>
            </tr>
          ) : (
            reglas.map((regla) => (
              <tr key={regla._id}>
                <td>{regla.prefijo}</td>
                <td>{regla.familia}</td>
                <td>{regla.subfamilia}</td>
                <td>{regla.descripcion}</td>
                <td>{regla.activo ? "Sí" : "No"}</td>
                <td>
                  <button onClick={() => eliminarRegla(regla._id)} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReglasPrefijo;