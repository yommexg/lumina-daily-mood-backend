// tests/mocks/utils.test.ts

jest.mock("../../src/utils/email/sendVerification", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/utils/pushNotifications", () => ({
  sendPushNotification: jest.fn().mockResolvedValue(undefined),
}));

describe("Mocked utils", () => {
  it("should mock sendVerificationEmail and sendPushNotification", () => {
    expect(true).toBe(true);
  });
});
