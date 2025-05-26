jest.mock("../../../src/utils/email/sendVerification", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("Mocked utils", () => {
  it("should mock sendVerificationEmail", () => {
    expect(true).toBe(true);
  });
});
