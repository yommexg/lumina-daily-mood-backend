import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import User from "../../src/models/User";
import { sendPushNotification } from "../../src/utils/pushNotifications";

jest.mock("../../src/utils/pushNotifications", () => ({
  sendPushNotification: jest.fn(),
}));

jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: "google@example.com",
          name: "Google User",
          picture: "https://example.com/avatar.jpg",
        }),
      }),
    })),
  };
});

describe("🔐 Google Login", () => {
  beforeEach(async () => {
    // await User.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("✅ logs in verified user with Google token", async () => {
    await User.create({
      name: "Google User",
      email: "google@example.com",
      googleId: "GOOGLE123",
      isVerified: true,
      expoPushToken: "ExponentPushToken[OLD]",
    });

    const res = await request(app).post("/api/auth/login-with-google").send({
      tokenId: "valid-google-token",
      expoPushToken: "ExponentPushToken[NEW]",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.body.token).toBeDefined();

    expect(sendPushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        pushTokens: ["ExponentPushToken[OLD]", "ExponentPushToken[NEW]"],
        title: expect.stringContaining("Login Successful"),
        body: expect.stringContaining("You logged in successfully"),
      })
    );

    const updatedUser = await User.findOne({ email: "google@example.com" });
    expect(updatedUser?.expoPushToken).toBe("ExponentPushToken[NEW]");
  });

  it("❌ fails if tokenId is missing", async () => {
    const res = await request(app).post("/api/auth/login-with-google").send({
      expoPushToken: "ExponentPushToken[MISSING]",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/google token missing/i);
  });

  it("❌ fails if user does not exist", async () => {
    const res = await request(app).post("/api/auth/login-with-google").send({
      tokenId: "valid-google-token",
      expoPushToken: "ExponentPushToken[NEW]",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/no account found/i);
  });

  it("❌ fails if account is not verified", async () => {
    await User.create({
      name: "Unverified",
      email: "google@example.com",
      googleId: "GOOGLE123",
      isVerified: false,
    });

    const res = await request(app).post("/api/auth/login-with-google").send({
      tokenId: "valid-google-token",
      expoPushToken: "ExponentPushToken[NEW]",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not verified/i);
  });

  it("❌ handles internal server errors", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest
      .spyOn(User, "findOne")
      .mockRejectedValueOnce(new Error("DB connection error"));

    const res = await request(app).post("/api/auth/login-with-google").send({
      tokenId: "valid-google-token",
      expoPushToken: "ExponentPushToken[ERR]",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/google login failed/i);
    consoleSpy.mockRestore();
  });
});
