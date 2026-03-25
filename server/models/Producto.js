const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  codigo: String,
  familia: String
});

module.exports = mongoose.model('Producto', productoSchema);