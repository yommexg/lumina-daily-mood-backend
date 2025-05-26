import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import User from "../../src/models/User";
import "../mocks/utils/email/sendVerificationEmail.test";
import { sendPushNotification } from "../../src/utils/pushNotifications";

jest.mock("../../src/utils/pushNotifications");

describe("Register Routes", () => {
  beforeEach(async () => {
    // await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // --- Regular registration ---

  it("❌ rejects request with no body", async () => {
    const res = await request(app).post("/api/auth/register").send();
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no request body/i);
  });

  it("❌ rejects if missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123!",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/missing user details/i);
  });

  it("❌ rejects invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "not-an-email",
      password: "Password123!",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  it("❌ rejects weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/weak password/i);
  });

  it("✅ registers a new user with valid details and sends push notification if token present", async () => {
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
    expect(userInDb?.expoPushToken).toBe("ExponentPushToken[TEST123]");
  });

  it("✅ registers a new user without expoPushToken (no push notification)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "No Token",
      email: "notoken@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    const userInDb = await User.findOne({ email: "notoken@example.com" });
    expect(userInDb?.expoPushToken).toBeUndefined();
  });

  it("❌ rejects duplicate verified user registration", async () => {
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

  it("♻️ re-registers an unverified user and updates details", async () => {
    await User.create({
      name: "Unverified",
      email: "unverified@example.com",
      password: "OldPassword",
      isVerified: false,
      expoPushToken: "OldToken",
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
    expect(updatedUser?.name).toBe("Unverified Updated");
  });

  it("❌ handles internal server errors (regular)", async () => {
    jest.spyOn(User, "create").mockRejectedValueOnce(new Error("DB error"));

    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).post("/api/auth/register").send({
      name: "Error User",
      email: "error@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/internal server error/i);

    consoleSpy.mockRestore();
  });

  // --- Google registration ---

  it("❌ rejects Google registration with no body", async () => {
    const res = await request(app)
      .post("/api/auth/register-with-google")
      .send();
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no request body/i);
  });

  it("❌ rejects Google registration missing email or googleId", async () => {
    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Test",
      email: "",
      googleId: "",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/incomplete details/i);
  });

  it("❌ rejects duplicate verified user registration with google", async () => {
    await User.create({
      name: "Existing User",
      email: "test@example.com",
      googleId: "GOOGLE_ID_123",
      avatar: "https://example.com/avatar.jpg",
      expoPushToken: "ExponentPushToken[GOOGLE]",
      isVerified: true,
    });

    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Duplicate User",
      email: "test@example.com",
      googleId: "GOOGLE_ID_123",
      avatar: "https://example.com/avatar.jpg",
      expoPushToken: "ExponentPushToken[GOOGLE]",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/user already exists/i);
  });

  it("✅ uses email prefix as name if name is not provided during Google registration", async () => {
    const email = "autogenuser@example.com";

    const res = await request(app).post("/api/auth/register-with-google").send({
      email,
      googleId: "GOOGLE_ID_AUTOGEN",
      expoPushToken: "ExponentPushToken[AUTO]",
      avatar: "https://example.com/avatar.jpg",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email });
    expect(user).not.toBeNull();
    expect(user?.name).toBe("autogenuser");
  });

  it("✅ registers a new user with Google and sends notification", async () => {
    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Google User",
      email: "google@example.com",
      googleId: "GOOGLE_ID_123",
      avatar: "https://example.com/avatar.jpg",
      expoPushToken: "ExponentPushToken[GOOGLE]",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: "google@example.com" });
    expect(user).not.toBeNull();
    expect(user?.googleId).toBe("GOOGLE_ID_123");

    // ✅ Assert push notification was sent
    expect(sendPushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        pushTokens: ["ExponentPushToken[GOOGLE]"],
        title: expect.any(String),
        body: expect.any(String),
      })
    );
  });

  it("♻️ re-registers existing unverified Google user", async () => {
    await User.create({
      name: "Google User",
      email: "google@example.com",
      googleId: "GOOGLE_ID_123",
      isVerified: false,
      avatar: "https://example.com/avatar.jpg",
    });

    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Google User Updated",
      email: "google@example.com",
      googleId: "GOOGLE_ID_123",
      avatar: "https://example.com/new-avatar.jpg",
      expoPushToken: "ExponentPushToken[UPDATED]",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findOne({ email: "google@example.com" });
    expect(updatedUser?.googleId).toBe("GOOGLE_ID_123");
    expect(updatedUser?.expoPushToken).toBe("ExponentPushToken[UPDATED]");
    expect(updatedUser?.avatar).toBe("https://example.com/new-avatar.jpg");
  });

  it("❌ handles internal server errors (Google)", async () => {
    jest.spyOn(User, "create").mockRejectedValueOnce(new Error("DB error"));

    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).post("/api/auth/register-with-google").send({
      name: "Error User",
      email: "error-google@example.com",
      googleId: "GOOGLE_ID_ERROR",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/internal server error/i);

    consoleSpy.mockRestore();
  });
});
