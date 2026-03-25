import { useEffect, useState } from "react";
import { obtenerProductosAgrupados } from "../services/productos";
import "../styles/productos-agrupados.css";

export default function ProductosAgrupados() {
  const [agrupados, setAgrupados] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerProductosAgrupados();
        setAgrupados(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos agrupados");
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  if (loading) return <p className="estado">Cargando...</p>;
  if (error) return <p className="estado error">{error}</p>;

  return (
    <section className="agrupados-page">
      <h1>Productos por categoría</h1>

      {Object.entries(agrupados).map(([categoria, subcategorias]) => (
        <div className="categoria-bloque" key={categoria}>
          <h2>{categoria}</h2>

          {Object.entries(subcategorias).map(([subcategoria, productos]) => (
            <div className="subcategoria-bloque" key={subcategoria}>
              <h3>{subcategoria}</h3>

              <div className="productos-grid">
                {productos.map((producto) => (
                  <article className="producto-card" key={producto._id}>
                    <span className="producto-codigo">{producto.codigo}</span>
                    <h4>{producto.nombre}</h4>
                    <p>${Number(producto.precio || 0).toLocaleString("es-AR")}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}