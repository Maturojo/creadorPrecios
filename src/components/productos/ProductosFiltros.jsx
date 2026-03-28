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
  return (
    <div className="productos-filtros">
      <input
        type="text"
        placeholder="Buscar por nombre o codigo..."
        value={busqueda}
        onChange={(event) => onBusquedaChange(event.target.value)}
      />

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
