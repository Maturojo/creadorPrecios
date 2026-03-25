import { useState } from 'react';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);

  const actualizarDatos = (nuevosDatos, familiaEspecifica = null) => {
    if (!familiaEspecifica) {
      // ACTUALIZACIÓN TOTAL: Reemplaza todo
      setProductos(nuevosDatos);
    } else {
      // ACTUALIZACIÓN POR FAMILIA: Solo toca los de esa categoría
      setProductos(prev => {
        // Mantenemos los que NO son de la familia, y agregamos los nuevos
        const otrosProductos = prev.filter(p => p.familia !== familiaEspecifica);
        return [...otrosProductos, ...nuevosDatos];
      });
    }
  };

  return { productos, actualizarDatos };
};