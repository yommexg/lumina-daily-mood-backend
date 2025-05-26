import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import User from "../../src/models/User";
import "../mocks/utils/email/sendVerificationEmail.test";
import "../mocks/utils/sendPushNotifications.test";

describe("Register Routes", () => {
  beforeEach(async () => {
    // await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Regular registration
  it("✅ registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      expoPushToken: "ExponentPushToken[TEST123]",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/verification/i);

    const userInDb = await User.findOne({ email: "test@example.com" });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.isVerified).toBe(false);
  });

  it("❌ rejects duplicate email registration if already verified", async () => {
    await User.create({
      name: "Existing User",
      email: "test@example.com",
      password: "hashedpassword",
      isVerified: true,
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: "test@example.com",
      password: "NewPassword123!",
      expoPushToken: "ExponentPushToken[DUPE]",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("♻️ re-registers an unverified user and sends a new verification email", async () => {
    await User.create({
      name: "Unverified",
      email: "unverified@example.com",
      password: "OldPassword",
      isVerified: false,
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Unverified Updated",
      email: "unverified@example.com",
      password: "NewPassword123!",
      expoPushToken: "ExponentPushToken[UPDATED]",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/verification/i);

    const updatedUser = await User.findOne({ email: "unverified@example.com" });
    expect(updatedUser?.expoPushToken).toBe("ExponentPushToken[UPDATED]");
  });

  // Google registration
  it("✅ registers a new user with Google", async () => {
    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Google User",
      email: "google@example.com",
      avatar: "https://example.com/avatar.jpg",
      googleId: "GOOGLE_ID_123",
      expoPushToken: "ExponentPushToken[GOOGLE]",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/verification/i);

    const userInDb = await User.findOne({ email: "google@example.com" });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.googleId).toBe("GOOGLE_ID_123");
    expect(userInDb?.expoPushToken).toBe("ExponentPushToken[GOOGLE]");
  });

  it("♻️ re-registers existing unverified Google user", async () => {
    await User.create({
      name: "Google User",
      email: "google@example.com",
      avatar: "https://example.com/avatar.jpg",
      googleId: "GOOGLE_ID_123",
      isVerified: false,
    });

    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Google User",
      email: "google@example.com",
      avatar: "https://example.com/avatar.jpg",
      googleId: "GOOGLE_ID_123",
      expoPushToken: "ExponentPushToken[GOOGLE_UPDATE]",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const updated = await User.findOne({ email: "google@example.com" });
    expect(updated?.googleId).toBe("GOOGLE_ID_123");
    expect(updated?.expoPushToken).toBe("ExponentPushToken[GOOGLE_UPDATE]");
  });

  it("❌ fails Google registration with missing email or Google ID", async () => {
    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Invalid",
      email: "",
      googleId: "",
      expoPushToken: "ExponentPushToken[FAIL]",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
