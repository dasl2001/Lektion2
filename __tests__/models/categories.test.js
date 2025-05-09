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
      expect(category.isActive).toBe(true); // default
    });

    test("should fail if name is missing", async () => {
      await expect(Category.create({ description: "Missing name" }))
        .rejects.toThrow(/Category name is required/);
    });

    test("should allow description to be optional", async () => {
      const category = await Category.create({ name: "Minimal" });
      expect(category.name).toBe("Minimal");
      expect(category.description).toBeUndefined();
    });

    test("should allow isActive to be false", async () => {
      const category = await Category.create({ name: "Inactive", isActive: false });
      expect(category.isActive).toBe(false);
    });

    test("should fail with non-boolean isActive", async () => {
  try {
    await Category.create({
      name: "Test",
      isActive: "yes"
    });
    throw new Error("Expected validation to fail");
  } catch (err) {
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.isActive).toBeDefined();
    expect(err.errors.isActive.message).toMatch(/Cast to Boolean failed/);
  }
});



   

    test("should fail with empty name string", async () => {
      await expect(Category.create({ name: "", description: "Nope" }))
        .rejects.toThrow(/Category name is required/);
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
        { name: "Updated" },
        { new: true }
      );
      expect(updated.name).toBe("Updated");
    });

    test("should delete a category", async () => {
      const category = await Category.create(validData);
      await Category.findByIdAndDelete(category._id);
      const check = await Category.findById(category._id);
      expect(check).toBeNull();
    });
  });

  describe("Edge Case Tests", () => {
    test("should allow special characters in name", async () => {
      const category = await Category.create({ name: "Café & Books" });
      expect(category.name).toBe("Café & Books");
    });

    test("should allow long names unless a max is set", async () => {
      const longName = "a".repeat(256);
      const category = await Category.create({ name: longName });
      expect(category.name.length).toBe(256);
    });
  });
});


