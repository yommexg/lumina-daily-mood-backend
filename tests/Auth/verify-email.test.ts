import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import User from "../../src/models/User";
import VerificationToken from "../../src/models/VerificationToken";
import "../mocks/utils/email/sendVerificationEmail.test";
import { sendPushNotification } from "../../src/utils/pushNotifications";

jest.mock("../../src/utils/pushNotifications");

describe("Email Verification", () => {
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});
    await VerificationToken.deleteMany({});
  });

  it("❌ returns 400 if token is missing", async () => {
    const res = await request(app).get("/api/auth/verify-email");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/token missing/i);
  });

  it("❌ returns 400 if token is expired or invalid", async () => {
    await VerificationToken.create({
      token: "EXPIRED_TOKEN",
      userId,
      expiresAt: new Date(Date.now() - 1000), // expired
    });

    const res = await request(app).get(
      "/api/auth/verify-email?token=EXPIRED_TOKEN"
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/expired or invalid/i);
  });

  it("❌ returns 404 if user is not found", async () => {
    await VerificationToken.create({
      token: "VALID_TOKEN_NO_USER",
      userId: new mongoose.Types.ObjectId(),
      expiresAt: new Date(Date.now() + 3600000),
    });

    const res = await request(app).get(
      "/api/auth/verify-email?token=VALID_TOKEN_NO_USER"
    );
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  it("✅ verifies email and deletes token (no push token)", async () => {
    const user = await User.create({
      _id: userId,
      name: "Test User",
      email: "nudge@example.com",
      password: "Password123!",
      isVerified: false,
    });

    await VerificationToken.create({
      token: "VALID_TOKEN_NO_PUSH",
      userId: user._id,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const res = await request(app).get(
      "/api/auth/verify-email?token=VALID_TOKEN_NO_PUSH"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.isVerified).toBe(true);
    expect(sendPushNotification).not.toHaveBeenCalled();

    const tokenInDb = await VerificationToken.findOne({
      token: "VALID_TOKEN_NO_PUSH",
    });
    expect(tokenInDb).toBeNull();
  });

  it("✅ verifies email and sends push notification if expoPushToken exists", async () => {
    const user = await User.create({
      _id: userId,
      name: "Test User",
      email: "push@example.com",
      password: "Password123!",
      isVerified: false,
      expoPushToken: "ExponentPushToken[ABC123]",
    });

    await VerificationToken.create({
      token: "VALID_TOKEN_WITH_PUSH",
      userId: user._id,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const res = await request(app).get(
      "/api/auth/verify-email?token=VALID_TOKEN_WITH_PUSH"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(sendPushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        pushTokens: ["ExponentPushToken[ABC123]"],
        title: expect.stringMatching(/verified/i),
        body: expect.stringMatching(/verified/i),
      })
    );
  });

  it("❌ returns 500 on internal server error", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest
      .spyOn(VerificationToken, "findOne")
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get(
      "/api/auth/verify-email?token=ERROR_TOKEN"
    );
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/internal server error/i);

    consoleSpy.mockRestore();
  });
});
