const mongoose = require("mongoose");

const subcategoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

subcategoriaSchema.index({ nombre: 1, categoria: 1 }, { unique: true });

module.exports =
  mongoose.models.Subcategoria ||
  mongoose.model("Subcategoria", subcategoriaSchema);