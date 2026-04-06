const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    colorPalette: {
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
  mongoose.models.Categoria || mongoose.model("Categoria", categoriaSchema);
