const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
    validate: {
      validator: function (val) {
        return typeof val === "boolean";
      },
      message: "isActive must be a boolean",
    },
  },
});

module.exports = mongoose.model("Category", categorySchema);

