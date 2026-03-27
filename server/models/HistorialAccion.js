const mongoose = require("mongoose");

const historialAccionSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    cantidad: {
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
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.HistorialAccion ||
  mongoose.model("HistorialAccion", historialAccionSchema);