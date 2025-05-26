import { sendPushNotification } from "../../../src/utils/pushNotifications";
import { Expo } from "expo-server-sdk";

describe("sendPushNotification", () => {
  const validToken = "ExponentPushToken[valid]";

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should send push notification and return tickets", async () => {
    const res = await sendPushNotification({
      pushTokens: [validToken],
      body: "Test body",
      title: "Test title",
    });

    expect(res).toHaveProperty(
      "message",
      "Push Notifications sent successfully."
    );
    expect(res.tickets[0]).toHaveProperty("status", "ok");
  });

  it("should throw if no push tokens provided", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(
      sendPushNotification({
        pushTokens: [],
        body: "Missing tokens",
      })
    ).rejects.toThrow("No push tokens provided.");

    consoleErrorSpy.mockRestore();
  });

  it("should throw if body is missing", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(
      sendPushNotification({
        pushTokens: [validToken],
        body: "",
      })
    ).rejects.toThrow("Message Body is required.");

    consoleErrorSpy.mockRestore();
  });

  it("should skip invalid tokens", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.spyOn(Expo, "isExpoPushToken").mockReturnValue(false);

    const res = await sendPushNotification({
      pushTokens: ["invalid-token"],
      body: "Test",
    });

    expect(res).toEqual({
      message: "Push Notifications sent successfully.",
      tickets: [],
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Push token invalid-token is not a valid Expo push token"
    );

    consoleErrorSpy.mockRestore();
  });

  it("should handle error during sendPushNotificationsAsync", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest
      .spyOn(Expo.prototype, "sendPushNotificationsAsync")
      .mockRejectedValueOnce(new Error("Send error"));

    await expect(
      sendPushNotification({
        pushTokens: [validToken],
        body: "Test body",
      })
    ).rejects.toThrow("Error sending push notifications.");

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should handle error during getPushNotificationReceiptsAsync", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest
      .spyOn(Expo.prototype, "getPushNotificationReceiptsAsync")
      .mockRejectedValueOnce(new Error("Receipt error"));

    await expect(
      sendPushNotification({
        pushTokens: [validToken],
        body: "Test body",
      })
    ).rejects.toThrow("Error retrieving receipts.");

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should log error for failed receipt status", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest
      .spyOn(Expo.prototype, "getPushNotificationReceiptsAsync")
      .mockResolvedValueOnce({
        "mock-ticket-id": {
          status: "error",
          message: "The device is not registered.",
          details: { error: "DeviceNotRegistered" },
        },
      });

    const res = await sendPushNotification({
      pushTokens: [validToken],
      body: "Error test",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error code: DeviceNotRegistered"
    );
    expect(res).toHaveProperty("message");

    consoleErrorSpy.mockRestore();
  });
});
