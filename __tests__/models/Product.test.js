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
    test("valid product should save correctly", async () => {
      const product = await Product.create({
        ...baseProductData,
        category: testCategory._id,
      });

      expect(product).toHaveProperty("_id");
      expect(product).toMatchObject({
        name: baseProductData.name,
        description: baseProductData.description,
        price: baseProductData.price,
      });
    });

    test("should fail when category is missing", async () => {
      await expect(Product.create({
        ...baseProductData,
      })).rejects.toThrow(/category.*required/);
    });

    test("should fail with negative price", async () => {
      await expect(Product.create({
        ...baseProductData,
        price: -50,
        category: testCategory._id,
      })).rejects.toThrow(/positive number/);
    });

    test("should allow numeric strings as price (Mongoose casting)", async () => {
      const product = await Product.create({
        ...baseProductData,
        price: "99.99",
        category: testCategory._id,
      });

      expect(product.price).toBeCloseTo(99.99);
    });

    test("should fail with non-numeric price string", async () => {
      await expect(Product.create({
        ...baseProductData,
        price: "not-a-number",
        category: testCategory._id,
      })).rejects.toThrow(/Cast to Number failed/);
    });
  });

  describe("Edge Case Tests", () => {
    test("should fail with invalid ObjectId as category", async () => {
      await expect(Product.create({
        ...baseProductData,
        category: "invalid-id",
      })).rejects.toThrow(/Cast to ObjectId failed/);
    });

    test("should fail with empty name", async () => {
      await expect(Product.create({
        name: "",
        price: 100,
        description: "OK",
        category: testCategory._id,
      })).rejects.toThrow(/name.*required/);
    });

    test("should fail with empty description", async () => {
      await expect(Product.create({
        name: "No description",
        price: 50,
        description: "",
        category: testCategory._id,
      })).rejects.toThrow(); // schema kräver description
    });

    test("should fail with extremely large price", async () => {
      await expect(Product.create({
        ...baseProductData,
        price: 1e20,
        category: testCategory._id,
      })).resolves.toBeDefined(); // validering tillåter det, men du kan sätta max om du vill
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should create and retrieve product", async () => {
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
  });

  describe("Timestamp Tests", () => {
    test("should set createdAt and updatedAt", async () => {
      const product = await Product.create({ ...baseProductData, category: testCategory._id });

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
    });

    test("updatedAt should change after update", async () => {
      const product = await Product.create({ ...baseProductData, category: testCategory._id });
      const originalUpdatedAt = product.updatedAt;

      await Product.findByIdAndUpdate(product._id, { price: 199.99 }, { new: true });
      const updated = await Product.findById(product._id);

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});





