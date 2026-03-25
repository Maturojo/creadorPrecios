import { useState, useEffect } from 'react';
import { DataLoader } from './components/DataLoader';
import { Cartel } from './components/Cartel';
import ReglasPrefijo from "./components/ReglasPrefijo";

<ReglasPrefijo />

function App() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // 1. Cargar productos desde el servidor (puerto 3001) al iniciar
  useEffect(() => {
    fetch('http://localhost:3001/api/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al conectar con el servidor:", err);
        setCargando(false);
      });
  }, []);

  // 2. Función para enviar datos al servidor y guardar en Atlas
  const handleData = async (nuevosDatos, tipo, nombreFamilia) => {
    try {
      const response = await fetch('http://localhost:3001/api/productos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipo,
          familia: nombreFamilia,
          datos: nuevosDatos
        })
      });

      if (response.ok) {
        alert("✅ Base de Datos actualizada en Atlas");
        // Refrescamos la lista de productos pidiendo los nuevos datos al servidor
        const actualizados = await fetch('http://localhost:3001/api/productos').then(res => res.json());
        setProductos(actualizados);
      }
    } catch (error) {
      alert("❌ Error: Revisa que la terminal del servidor (puerto 3001) esté encendida.");
    }
  };

  // 3. Lógica de filtrado combinada (Familia + Texto de búsqueda)
  const productosFiltrados = productos.filter(p => {
    const cumpleFamilia = filtro === 'TODAS' || p.familia === filtro;
    const nombreLimpio = p.nombre ? p.nombre.toLowerCase() : "";
    const idLimpio = p.id ? p.id.toString().toLowerCase() : "";
    const textoBusqueda = busqueda.toLowerCase();
    
    return cumpleFamilia && (nombreLimpio.includes(textoBusqueda) || idLimpio.includes(textoBusqueda));
  });

  // Obtener lista de familias únicas para el selector
  const familias = ['TODAS', ...new Set(productos.map(p => p.familia))];

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans">
      
      {/* SECCIÓN DE CONTROL (No se imprime) */}
      <header className="no-print max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-8 border-l-8 border-blue-600">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Sur Maderas - Gestor de Precios</h1>
            <p className="text-slate-500 text-sm font-medium">Conectado a MongoDB Atlas | <span className="text-blue-600">{productos.length} productos</span></p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            🖨️ IMPRIMIR CARTELERÍA
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Componente para subir el Excel */}
          <DataLoader onDataLoaded={handleData} />
          
          <div className="flex flex-col gap-4">
            {/* Buscador de texto */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Buscar producto (Nombre o Código):</label>
              <input 
                type="text"
                placeholder="Ej: Mesa de pino, Pincel, AC1..."
                className="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition-all shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Selector de familias */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Filtrar por Familia:</label>
              <select 
                className="w-full border-2 border-slate-200 p-3 rounded-lg font-bold text-slate-700 outline-none focus:border-blue-500" 
                onChange={(e) => setFiltro(e.target.value)}
                value={filtro}
              >
                {familias.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ÁREA DE VISUALIZACIÓN DE CARTELERA */}
      {cargando ? (
        <div className="text-center p-20 font-bold text-slate-400 italic animate-pulse">
          Cargando productos desde la nube...
        </div>
      ) : (
        <main className="flex flex-wrap justify-center gap-4 bg-white p-8 rounded-xl shadow-inner min-h-[500px]">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((p, index) => (
              <Cartel key={index} producto={p} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 mt-20">
              <span className="text-5xl mb-4">🔍</span>
              <p className="italic">No se encontraron productos para esta búsqueda...</p>
            </div>
          )}
        </main>
      )}

      {/* Estilos CSS extra para que los carteles no se corten al imprimir */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; p: 0; }
          main { shadow: none !important; border: none !important; p: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export default App;