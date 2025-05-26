import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import app from "../../src/server";
import User from "../../src/models/User";
import { sendPushNotification } from "../../src/utils/pushNotifications";

jest.mock("../../src/utils/pushNotifications", () => ({
  sendPushNotification: jest.fn(),
}));

describe("Login", () => {
  const userPassword = "ValidPass123!";
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(userPassword, 10);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // await User.deleteMany({});
    jest.clearAllMocks();
  });

  it("✅ logs in a verified user", async () => {
    await User.create({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      isVerified: true,
      expoPushToken: "ExponentPushToken[OLD]",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: userPassword,
      expoPushToken: "ExponentPushToken[NEW]",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.body.token).toBeDefined();

    expect(sendPushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        pushTokens: ["ExponentPushToken[OLD]", "ExponentPushToken[NEW]"],
        title: expect.any(String),
        body: expect.stringContaining("You logged in successfully"),
      })
    );

    const updatedUser = await User.findOne({ email: "test@example.com" });
    expect(updatedUser?.expoPushToken).toBe("ExponentPushToken[NEW]");
  });

  it("❌ rejects login with wrong password", async () => {
    await User.create({
      name: "Test User",
      email: "wrongpass@example.com",
      password: hashedPassword,
      isVerified: true,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrongpass@example.com",
      password: "WrongPassword!",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid password/i);
    expect(sendPushNotification).not.toHaveBeenCalled();
  });

  it("❌ rejects login for non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "Whatever123!",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  it("❌ rejects login for unverified user", async () => {
    await User.create({
      name: "Test User",
      email: "unverified@example.com",
      password: hashedPassword,
      isVerified: false,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "unverified@example.com",
      password: userPassword,
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not verified/i);
  });

  it("❌ rejects login if account uses Google Sign-in", async () => {
    await User.create({
      name: "Test User",
      email: "googleuser@example.com",
      googleId: "GOOGLE123",
      isVerified: true,
    });

    const res = await request(app).post("/api/auth/login").send({
      name: "Test User",
      email: "googleuser@example.com",
      password: "AnyPass123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/google sign-in/i);
  });

  it("❌ rejects login with missing email or password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("❌ rejects login when user has no password (likely malformed account)", async () => {
    await User.create({
      name: "Test User",
      email: "nopassword@example.com",
      password: null,
      isVerified: true,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "nopassword@example.com",
      password: "doesntmatter",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("✅ skips push notification if no expo token provided", async () => {
    await User.create({
      name: "Test User",
      email: "notoken@example.com",
      password: hashedPassword,
      isVerified: true,
      expoPushToken: null,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "notoken@example.com",
      password: userPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(sendPushNotification).not.toHaveBeenCalled();
  });

  it("✅ does not update expo token if unchanged", async () => {
    await User.create({
      name: "Test User",
      email: "sameexpo@example.com",
      password: hashedPassword,
      isVerified: true,
      expoPushToken: "ExponentPushToken[SAME]",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "sameexpo@example.com",
      password: userPassword,
      expoPushToken: "ExponentPushToken[SAME]",
    });

    expect(res.statusCode).toBe(200);
    expect(sendPushNotification).toHaveBeenCalled();
  });

  it("❌ handles internal server error gracefully", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("DB failure"));

    const res = await request(app).post("/api/auth/login").send({
      email: "fail@example.com",
      password: "password",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/internal server error/i);
    consoleSpy.mockRestore();
  });

  // Test for Google Login with No payload
  it("❌ fails if Google token is invalid (getPayload is null)", async () => {
    // Prepare user to prevent "no account found" confusion
    await User.create({
      name: "Google User",
      email: "google@example.com",
      googleId: "GOOGLE123",
      isVerified: true,
      expoPushToken: "ExponentPushToken[OLD]",
    });

    // Override verifyIdToken to return getPayload as null
    OAuth2Client.prototype.verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => null,
    });

    const res = await request(app).post("/api/auth/login-with-google").send({
      tokenId: "invalid-google-token",
      expoPushToken: "ExponentPushToken[BROKEN]",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid google token/i);
  });
});
