const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products with filtering + populate category
router.get("/", async (req, res) => {
  try {
    const { name, minPrice, maxPrice, category } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (category) filter.category = category;

    const products = await Product.find(filter).populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
});

// CREATE new product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

// DELETE all
router.delete("/", async (req, res) => {
  try {
    await Product.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting all products" });
  }
});

module.exports = router;



