const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../../models/Product");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe("Product Model Test Suite", () => {
  const validProductData = {
    name: "Test Product",
    price: 99.99,
    description: "Test Description",
  };

  describe("Validation Tests", () => {
    test("should validate a valid product", async () => {
      const validProduct = new Product(validProductData);
      const savedProduct = await validProduct.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(validProductData.name);
      expect(savedProduct.price).toBeCloseTo(validProductData.price, 2);
      expect(savedProduct.description).toBe(validProductData.description);
    });

    test("should fail validation when name is missing", async () => {
      const productWithoutName = new Product({
        price: 99.99,
        description: "Test Description",
      });

      let err;
      try {
        await productWithoutName.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
    });

    test("should fail validation for negative prices", async () => {
      const productWithNegativePrice = new Product({
        name: "Test Product",
        price: -10.99,
        description: "Test Description",
      });

      await expect(productWithNegativePrice.save()).rejects.toThrow();
    });

    test("should fail validation for string price", async () => {
      const productWithStringPrice = new Product({
        name: "Test Product",
        price: "99.99",
        description: "Test Description",
      });

      await expect(productWithStringPrice.save()).rejects.toThrow();
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should create & retrieve product successfully", async () => {
      const validProduct = new Product(validProductData);
      const savedProduct = await validProduct.save();

      const foundProduct = await Product.findById(savedProduct._id);
      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe(validProductData.name);
    });

    test("should update product name successfully", async () => {
      const product = new Product(validProductData);
      await product.save();

      const updatedName = "Updated Product Name";
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { name: updatedName },
        { new: true }
      );

      expect(updatedProduct.name).toBe(updatedName);
    });

    test("should handle concurrent updates (last write wins)", async () => {
      const product = new Product(validProductData);
      await product.save();

      const update1 = Product.findByIdAndUpdate(product._id, { price: 199.99 });
      const update2 = Product.findByIdAndUpdate(product._id, { price: 299.99 });

      await Promise.all([update1, update2]);

      const updatedProduct = await Product.findById(product._id);
      expect([199.99, 299.99]).toContain(updatedProduct.price);
    });
  });

  describe("Timestamp Tests", () => {
    test("should have createdAt and updatedAt timestamps", async () => {
      const product = new Product(validProductData);
      const savedProduct = await product.save();

      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();

      await Product.findByIdAndUpdate(savedProduct._id, { price: 199.99 });
      const updatedProduct = await Product.findById(savedProduct._id);
      expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(savedProduct.updatedAt.getTime());
    });

    test("should have createdAt equal to updatedAt on creation", async () => {
      const product = new Product(validProductData);
      const savedProduct = await product.save();

      expect(savedProduct.createdAt.getTime()).toBe(savedProduct.updatedAt.getTime());
    });
  });
});

