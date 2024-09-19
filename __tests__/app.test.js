const superTest = require("supertest");
const app = require("../app.js");

describe("GET /", () => {
  it("should respond with status 200", async () => {
    const response = await superTest(app).get("/");
    expect(response.status).toBe(200);
  });
  it("should respond with correct message", async () => {
    const response = await superTest(app).get("/");
    expect(response.text).toBe("Welcome to Intel Loom's Backend!");
  });
});

describe("GET-POST-PUT-DELETE /ANY OTHER ROUTE", () => {
  it("should respond with status 404 - GET", async () => {
    const response = await superTest(app).get("/getThis");
    expect(response.status).toBe(404);
  });
  it("should respond with correct message - GET", async () => {
    const response = await superTest(app).get("/getThis");
    expect(response.text).toBe("Page not found");
  });
  it("should respond with status 404 - POST", async () => {
    const response = await superTest(app).post("/postThis");
    expect(response.status).toBe(404);
  });
  it("should respond with correct message - POST", async () => {
    const response = await superTest(app).post("/postThis");
    expect(response.text).toBe("Page not found");
  });
  it("should respond with status 404 - PUT", async () => {
    const response = await superTest(app).put("/changeThis");
    expect(response.status).toBe(404);
  });
  it("should respond with correct message - PUT", async () => {
    const response = await superTest(app).put("/changeThis");
    expect(response.text).toBe("Page not found");
  });
  it("should respond with status 404 - DELETE", async () => {
    const response = await superTest(app).delete("/removeThis");
    expect(response.status).toBe(404);
  });
  it("should respond with correct message - DELETE", async () => {
    const response = await superTest(app).delete("/removeThis");
    expect(response.text).toBe("Page not found");
  });
});

describe("GET /users", () => {
  it("should respond with status 403", async () => {
    const response = await superTest(app).get("/users");
    expect(response.status).toBe(403);
  });
  it("should respond with correct message", async () => {
    const response = await superTest(app).get("/users");
    expect(response.text).toBe("Unauthorized");
  });
});

describe("GET /users/:id", () => {
  it("should respond with status 401 since no token provided", async () => {
    const response = await superTest(app).get("/users/1");
    expect(response.status).toBe(401);
  });
  it("should respond with correct message", async () => {
    const response = await superTest(app).get("/users/1");
    expect(response.body.error).toBe("No token provided");
  });
});
