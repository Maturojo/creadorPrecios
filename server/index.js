const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Producto = require('./models/Producto'); // ajustá la ruta si hace falta

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ruta para obtener productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para carga masiva
app.post('/api/productos/bulk', async (req, res) => {
  const { tipo, familia, datos } = req.body;

  try {
    if (tipo === 'total') {
      await Producto.deleteMany({});
    }

    const guardados = await Producto.insertMany(datos);
    console.log(`Se guardaron ${guardados.length} productos en Atlas`);

    res.json({ success: true, count: guardados.length });
  } catch (error) {
    console.error("Error al guardar:", error);
    res.status(500).json({ error: error.message });
  }
});

console.log("Intentando conectar a:", process.env.MONGO_URI);

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ ERROR: No se encontró la variable MONGO_URI en el archivo .env");
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("❌ Error de conexión:", err));