const mongoose = require("mongoose");

const reglaPrefijoSchema = new mongoose.Schema(
  {
    prefijo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    familia: {
      type: String,
      required: true,
      trim: true,
    },
    subfamilia: {
      type: String,
      default: "",
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReglaPrefijo", reglaPrefijoSchema);