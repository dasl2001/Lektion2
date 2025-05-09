const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../server");
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

describe("Category API Test Suite", () => {
  const categoryData = {
    name: "Electronics",
    description: "All kinds of tech",
  };

  test("should create a new category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send(categoryData);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(categoryData.name);

    const saved = await Category.findOne({ name: categoryData.name });
    expect(saved).toBeDefined();
  });

  test("should fail to create category without name", async () => {
    const res = await request(app).post("/api/categories").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/name.*required/i);
  });

  test("should return all categories", async () => {
    await Category.insertMany([
      { name: "Books" },
      { name: "Clothing" },
    ]);

    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("should get a single category by ID", async () => {
    const cat = await Category.create({ name: "Furniture" });

    const res = await request(app).get(`/api/categories/${cat._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Furniture");
  });

  test("should return 404 for unknown ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/categories/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  test("should update a category", async () => {
    const cat = await Category.create({ name: "Old Name" });

    const res = await request(app)
      .put(`/api/categories/${cat._id}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("New Name");
  });

  test("should delete a category", async () => {
    const cat = await Category.create({ name: "To Delete" });

    const res = await request(app).delete(`/api/categories/${cat._id}`);
    expect(res.statusCode).toBe(204);

    const check = await Category.findById(cat._id);
    expect(check).toBeNull();
  });
});
