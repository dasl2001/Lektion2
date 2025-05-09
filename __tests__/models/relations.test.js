const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");

const Category = require("../../models/Category");
const Product = require("../../models/Product");

let mongoServer;
let app;
let category;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  app = require("../../server");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Category.deleteMany();
  await Product.deleteMany();

  category = await Category.create({ name: "TestCat" });
});

describe("Relations Test Suite", () => {
  test("should populate category in GET /products", async () => {
    await Product.create({
      name: "With Category",
      price: 100,
      description: "Has cat",
      category: category._id,
    });

    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].category.name).toBe("TestCat");
  });

  test("should filter products by category", async () => {
    await Product.create({
      name: "Filtered Product",
      price: 50,
      description: "Relevant",
      category: category._id,
    });

    const res = await request(app).get(`/api/products?category=${category._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Filtered Product");
  });

  test("should prevent deletion of used category", async () => {
    await Product.create({
      name: "Bound Product",
      price: 100,
      description: "Tied to category",
      category: category._id,
    });

    const res = await request(app).delete(`/api/categories/${category._id}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/used by existing products/);
  });
});
