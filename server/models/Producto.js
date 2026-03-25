const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      default: 0,
    },
    categoria: {
      type: String,
      default: "",
      trim: true,
    },
    subcategoria: {
      type: String,
      default: "",
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Producto || mongoose.model("Producto", productoSchema);