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
      const savedProduct = await Product.create(validProductData);

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(validProductData.name);
      expect(savedProduct.price).toBeCloseTo(validProductData.price, 2);
      expect(savedProduct.description).toBe(validProductData.description);
    });

    test("should fail validation when name is missing", async () => {
      await expect(Product.create({
        price: 99.99,
        description: "Test Description",
      })).rejects.toThrow(/name.*required/);
    });

    test("should fail validation for negative prices", async () => {
      await expect(Product.create({
        name: "Test Product",
        price: -10.99,
        description: "Test Description",
      })).rejects.toThrow("Price must be a positive number");
    });

    test("should allow numeric strings like '99.99' by design", async () => {
      const product = await Product.create({
        name: "Test Product",
        price: "99.99",
        description: "Test Description",
      });

      expect(product.price).toBeCloseTo(99.99, 2);
    });

    test("should fail validation for non-numeric price string", async () => {
      await expect(Product.create({
        name: "Test Product",
        price: "not-a-number",
        description: "Test Description",
      })).rejects.toThrow(/Cast to Number failed/);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should create & retrieve product successfully", async () => {
      const savedProduct = await Product.create(validProductData);
      const foundProduct = await Product.findById(savedProduct._id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe(validProductData.name);
    });

    test("should update product name successfully", async () => {
      const product = await Product.create(validProductData);
      const updatedName = "Updated Product Name";

      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { name: updatedName },
        { new: true }
      );

      expect(updatedProduct.name).toBe(updatedName);
    });

    test("should handle concurrent updates (last write wins)", async () => {
      const product = await Product.create(validProductData);

      const update1 = Product.findByIdAndUpdate(product._id, { price: 199.99 });
      const update2 = Product.findByIdAndUpdate(product._id, { price: 299.99 });

      await Promise.all([update1, update2]);

      const updatedProduct = await Product.findById(product._id);
      expect([199.99, 299.99]).toContain(updatedProduct.price);
    });
  });

  describe("Timestamp Tests", () => {
    test("should have createdAt and updatedAt timestamps", async () => {
      const product = await Product.create(validProductData);

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();

      const updated = await Product.findByIdAndUpdate(
        product._id,
        { price: 199.99 },
        { new: true }
      );

      expect(updated.updatedAt.getTime()).toBeGreaterThan(product.updatedAt.getTime());
    });

    test("should have createdAt equal to updatedAt on creation", async () => {
      const product = await Product.create(validProductData);
      expect(product.createdAt.getTime()).toBe(product.updatedAt.getTime());
    });
  });
});



