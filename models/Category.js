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
    set: function (val) {
      if (typeof val !== "boolean") {
        throw new mongoose.Error.ValidatorError({
          message: "isActive must be a boolean",
        });
      }
      return val;
    }
  }
});

module.exports = mongoose.model("Category", categorySchema);


