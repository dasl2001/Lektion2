const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
      validate: {
        validator: function (value) {
          return typeof value === "number" && Number.isFinite(value);
        },
        message: "Price must be a valid number",
      },
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);


