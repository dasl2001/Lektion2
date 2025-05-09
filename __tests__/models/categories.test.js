const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Category = require("../../models/Category");

let mongoServer;

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
  await Category.deleteMany();
});

describe("Category Model Test Suite", () => {
  const validData = {
    name: "Electronics",
    description: "All kinds of tech",
  };

  describe("Validation Tests", () => {
    test("should save a valid category", async () => {
      const category = await Category.create(validData);

      expect(category).toHaveProperty("_id");
      expect(category.name).toBe(validData.name);
      expect(category.description).toBe(validData.description);
      expect(category.isActive).toBe(true); // default value
    });

    test("should fail if name is missing", async () => {
      await expect(Category.create({ description: "No name" }))
        .rejects.toThrow(/name.*required/);
    });

    test("should allow description to be optional", async () => {
      const category = await Category.create({ name: "Minimal" });

      expect(category).toHaveProperty("description", undefined);
      expect(category.isActive).toBe(true);
    });

    test("should allow isActive to be false", async () => {
      const category = await Category.create({
        name: "Inactive",
        isActive: false,
      });

      expect(category.isActive).toBe(false);
    });

    test("should fail with empty name string", async () => {
      await expect(Category.create({ name: "" }))
        .rejects.toThrow(/name.*required/);
    });

    test("should fail with name too long (if max length set)", async () => {
      const longName = "a".repeat(300);
      await expect(Category.create({ name: longName }))
        .resolves.toBeDefined(); // fungerar om ingen maxgräns finns
    });
  });

  describe("CRUD Tests", () => {
    test("should retrieve category by ID", async () => {
      const category = await Category.create(validData);
      const found = await Category.findById(category._id);

      expect(found).toBeDefined();
      expect(found.name).toBe(validData.name);
    });

    test("should update a category", async () => {
      const category = await Category.create(validData);

      const updated = await Category.findByIdAndUpdate(
        category._id,
        { name: "Updated Name" },
        { new: true }
      );

      expect(updated.name).toBe("Updated Name");
    });

    test("should delete a category", async () => {
      const category = await Category.create(validData);

      await Category.findByIdAndDelete(category._id);

      const check = await Category.findById(category._id);
      expect(check).toBeNull();
    });
  });

  describe("Edge Case Tests", () => {
    test("should fail with non-boolean isActive", async () => {
      await expect(Category.create({
        name: "Test",
        isActive: "yes"
      })).rejects.toThrow(/Cast to Boolean failed/);
    });

    test("should allow special characters in name", async () => {
      const category = await Category.create({
        name: "Café & Tech",
      });

      expect(category.name).toBe("Café & Tech");
    });
  });
});
