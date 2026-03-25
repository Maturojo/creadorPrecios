import { useEffect, useState } from "react";

const API = "http://localhost:3001";

function ReglasPrefijo() {
  const [reglas, setReglas] = useState([]);
  const [form, setForm] = useState({
    prefijo: "",
    familia: "",
    subfamilia: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);

  async function cargarReglas() {
    try {
      const res = await fetch(`${API}/api/reglas-prefijo`);
      const data = await res.json();
      setReglas(data);
    } catch (error) {
      console.error("Error cargando reglas:", error);
    }
  }

  useEffect(() => {
    cargarReglas();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function guardarRegla(e) {
  e.preventDefault();

  if (!form.prefijo.trim() || !form.familia.trim()) {
    alert("Prefijo y familia son obligatorios");
    return;
  }

  setLoading(true);

  try {
    console.log("Enviando al backend...", form);

    const res = await fetch(`${API}/api/reglas-prefijo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    console.log("Status:", res.status);

    const data = await res.json();
    console.log("Respuesta backend:", data);

    if (!res.ok) {
      throw new Error(data.error || "Error al guardar");
    }

    setForm({
      prefijo: "",
      familia: "",
      subfamilia: "",
      descripcion: "",
    });

    await cargarReglas();
    alert("Regla guardada correctamente");
  } catch (error) {
    console.error("Error guardando regla:", error);
    alert(error.message || "Error guardando regla");
  } finally {
    setLoading(false);
  }
}

  async function eliminarRegla(id) {
    const ok = confirm("¿Eliminar esta regla?");
    if (!ok) return;

    try {
      await fetch(`${API}/api/reglas-prefijo/${id}`, {
        method: "DELETE",
      });
      cargarReglas();
    } catch (error) {
      console.error("Error eliminando regla:", error);
    }
  }

  async function reaplicarReglas() {
    const ok = confirm("¿Reaplicar reglas a todos los productos?");
    if (!ok) return;

    try {
      const res = await fetch(`${API}/api/reglas-prefijo/reaplicar`, {
        method: "POST",
      });
      const data = await res.json();
      alert(`Productos actualizados: ${data.actualizados}`);
    } catch (error) {
      console.error("Error reaplicando reglas:", error);
      alert("Error al reaplicar");
    }
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Reglas de Prefijos</h2>

      <form onSubmit={guardarRegla} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="prefijo"
          placeholder="Prefijo (ej: AC)"
          value={form.prefijo}
          onChange={handleChange}
        />
        <input
          type="text"
          name="familia"
          placeholder="Familia"
          value={form.familia}
          onChange={handleChange}
        />
        <input
          type="text"
          name="subfamilia"
          placeholder="Subfamilia"
          value={form.subfamilia}
          onChange={handleChange}
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar regla"}
        </button>
      </form>

      <button onClick={reaplicarReglas} style={{ marginBottom: "15px" }}>
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
          {reglas.map((regla) => (
            <tr key={regla._id}>
              <td>{regla.prefijo}</td>
              <td>{regla.familia}</td>
              <td>{regla.subfamilia}</td>
              <td>{regla.descripcion}</td>
              <td>{regla.activo ? "Sí" : "No"}</td>
              <td>
                <button onClick={() => eliminarRegla(regla._id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReglasPrefijo;