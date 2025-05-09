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
        validator: Number.isFinite,
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

// Add text indexes for search functionality
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);

