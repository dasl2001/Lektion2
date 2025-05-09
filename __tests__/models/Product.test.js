const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../../models/Product");
const Category = require("../../models/Category");

let mongoServer;
let testCategory;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany();
  await Category.deleteMany();

  // Skapa en testkategori som används i alla produkter
  testCategory = await Category.create({
    name: "Test Category",
    description: "Just for testing",
  });
});

describe("Product Model Test Suite", () => {
  const baseProductData = {
    name: "Test Product",
    price: 99.99,
    description: "Test Description",
  };

  describe("Validation Tests", () => {
    test("should validate a valid product", async () => {
      const savedProduct = await Product.create({
        ...baseProductData,
        category: testCategory._id,
      });

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(baseProductData.name);
      expect(savedProduct.price).toBeCloseTo(baseProductData.price, 2);
      expect(savedProduct.category.toString()).toBe(testCategory._id.toString());
    });

    test("should fail when category is missing", async () => {
      await expect(Product.create({
        ...baseProductData,
        // missing category
      })).rejects.toThrow(/category.*required/);
    });

    test("should fail validation for negative prices", async () => {
      await expect(Product.create({
        ...baseProductData,
        price: -1,
        category: testCategory._id,
      })).rejects.toThrow("Price must be a positive number");
    });

    test("should allow numeric strings like '99.99' (Mongoose behavior)", async () => {
      const product = await Product.create({
        ...baseProductData,
        price: "99.99", // string that will be cast
        category: testCategory._id,
      });

      expect(product.price).toBeCloseTo(99.99);
    });

    test("should fail for non-numeric price strings", async () => {
      await expect(Product.create({
        ...baseProductData,
        price: "not-a-number",
        category: testCategory._id,
      })).rejects.toThrow(/Cast to Number failed/);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should create & retrieve a product", async () => {
      const saved = await Product.create({ ...baseProductData, category: testCategory._id });
      const found = await Product.findById(saved._id);

      expect(found).toBeDefined();
      expect(found.name).toBe(baseProductData.name);
    });

    test("should update product name", async () => {
      const product = await Product.create({ ...baseProductData, category: testCategory._id });

      const updated = await Product.findByIdAndUpdate(
        product._id,
        { name: "Updated Name" },
        { new: true }
      );

      expect(updated.name).toBe("Updated Name");
    });

    test("should support concurrent updates", async () => {
      const product = await Product.create({ ...baseProductData, category: testCategory._id });

      const update1 = Product.findByIdAndUpdate(product._id, { price: 199.99 });
      const update2 = Product.findByIdAndUpdate(product._id, { price: 299.99 });

      await Promise.all([update1, update2]);

      const result = await Product.findById(product._id);
      expect([199.99, 299.99]).toContain(result.price);
    });
  });

  describe("Timestamp Tests", () => {
    test("should have createdAt and updatedAt timestamps", async () => {
      const product = await Product.create({ ...baseProductData, category: testCategory._id });

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();

      const updated = await Product.findByIdAndUpdate(
        product._id,
        { price: 150 },
        { new: true }
      );

      expect(updated.updatedAt.getTime()).toBeGreaterThan(product.updatedAt.getTime());
    });

    test("should have identical createdAt and updatedAt at creation", async () => {
      const product = await Product.create({ ...baseProductData, category: testCategory._id });

      expect(product.createdAt.getTime()).toBe(product.updatedAt.getTime());
    });
  });
});




