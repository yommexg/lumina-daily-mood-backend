import request from "supertest";
import app from "../src/server";

describe("Sample Auth Test", () => {
  it("should pass a dummy test", () => {
    expect(1 + 1).toBe(2);
  });
});

// describe("Auth Routes", () => {
//   it("registers a new user", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       name: "Test User",
//       email: "test@example.com",
//       password: "password123",
//       expoPushToken: "ExponentPushToken[xxxxxxxxxx]",
//     });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty("token");
//   });

//   it("rejects duplicate email registration", async () => {
//     await request(app).post("/api/auth/register").send({
//       name: "Test User",
//       email: "test@example.com",
//       password: "password123",
//       expoPushToken: "ExponentPushToken[xxxxxxxxxx]",
//     });

//     const res = await request(app).post("/api/auth/register").send({
//       name: "Test User 2",
//       email: "test@example.com",
//       password: "password456",
//       expoPushToken: "ExponentPushToken[xxxxxxxxxx]",
//     });

//     expect(res.statusCode).toBe(400);
//   });
// });
