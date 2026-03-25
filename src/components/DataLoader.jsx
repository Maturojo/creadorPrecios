import * as XLSX from 'xlsx';

export const DataLoader = ({ onDataLoaded }) => {
  const handleFileUpload = (e, esActualizacionPorFamilia) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const bstr = event.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);

      let nombreFamilia = "GENERAL";
      if (esActualizacionPorFamilia) {
        nombreFamilia = prompt("¿A qué FAMILIA pertenecen estos productos? (Ej: PINCELES, ACRILICOS)", "GENERAL");
      }

      // Mapeo exacto de tu Excel: barras, nombre, precio
      const dataProcesada = rawData.map(item => ({
        id: item.barras || 'S/N',
        nombre: item.nombre || 'Sin nombre',
        precio: parseFloat(item.precio) || 0,
        familia: nombreFamilia.toUpperCase()
      }));

      onDataLoaded(dataProcesada, esActualizacionPorFamilia ? 'familia' : 'total', nombreFamilia.toUpperCase());
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded bg-gray-50 shadow-sm mb-6">
      <div className="flex flex-col">
        <label className="font-bold text-sm mb-1">Carga Completa (Borra lo anterior):</label>
        <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, false)} 
               className="text-xs border p-1 rounded bg-white" />
      </div>
      
      <div className="flex flex-col border-t pt-2">
        <label className="font-bold text-sm text-blue-600 mb-1">Actualizar o Agregar Familia:</label>
        <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, true)} 
               className="text-xs border p-1 rounded bg-white" />
      </div>
    </div>
  );
};