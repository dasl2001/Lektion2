const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Product = require("../models/Product");

// GET all categories
router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// GET one category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  } catch {
    res.status(500).json({ error: "Error fetching category" });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE category (with restrict behavior)
router.delete("/:id", async (req, res) => {
  try {
    const inUse = await Product.findOne({ category: req.params.id });
    if (inUse) {
      return res.status(400).json({
        error: "Cannot delete category: it is used by existing products.",
      });
    }

    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;

