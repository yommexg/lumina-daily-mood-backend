import transporter from "../../../../src/utils/email/transporter";
import { sendVerificationEmail } from "../../../../src/utils/email/sendVerification";

describe("sendVerificationEmail", () => {
  const email = "test@example.com";
  const name = "Test User";
  const token = "verification-token";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRO_FRONTEND_URL = "https://frontend.test";
  });

  it("sends email with correct parameters", async () => {
    (transporter.sendMail as jest.Mock).mockResolvedValue({});
    await sendVerificationEmail(email, name, token);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);

    const mailOptions = (transporter.sendMail as jest.Mock).mock.calls[0][0];
    expect(mailOptions.to).toBe(email);
    expect(mailOptions.subject).toContain("Verify your Lumina account");
    expect(mailOptions.html).toContain(name);
    expect(mailOptions.html).toContain(token);
    expect(mailOptions.attachments[0]).toHaveProperty("cid", "icon");
  });

  it("throws error if email, name or token is missing", async () => {
    const badCases = [
      ["", name, token],
      [email, "", token],
      [email, name, ""],
    ];

    for (const [badEmail, badName, badToken] of badCases) {
      await expect(
        sendVerificationEmail(badEmail, badName, badToken)
      ).rejects.toThrow("Email, name, and token are required");
    }
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });
});
