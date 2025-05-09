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
  },
});


categorySchema.pre("validate", function (next) {
  if (this.isActive !== undefined && typeof this.isActive !== "boolean") {
    return next(
      new mongoose.Error.ValidationError(
        new mongoose.Error.ValidatorError({
          message: "isActive must be a boolean",
          path: "isActive",
        })
      )
    );
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);



