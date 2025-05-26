import { sendPushNotification } from "../../../src/utils/pushNotifications";

describe("sendPushNotification", () => {
  const validToken = "ExponentPushToken[valid]";

  it("should send push notification and return tickets", async () => {
    const res = await sendPushNotification({
      pushTokens: [validToken],
      body: "Test body",
      title: "Test title",
    });

    expect(res).toHaveProperty("message");
    expect(res.tickets[0]).toHaveProperty("status", "ok");
  });

  it("should throw if no push tokens provided", async () => {
    await expect(
      sendPushNotification({
        pushTokens: [],
        body: "Missing tokens",
        title: "Test title",
      })
    ).rejects.toThrow("No push tokens provided.");
  });

  it("should throw if body is missing", async () => {
    await expect(
      sendPushNotification({
        pushTokens: [validToken],
        body: "", // Missing body
        title: "No body",
      })
    ).rejects.toThrow("Message Body is required.");
  });

  it("should skip invalid tokens", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await sendPushNotification({
      pushTokens: ["invalid-token"],
      body: "Should skip invalid",
    });

    expect(res).toEqual({
      message: "Push Notifications sent successfully.",
      tickets: [],
    });

    spy.mockRestore();
  });
});
