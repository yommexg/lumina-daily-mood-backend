jest.unmock("../../../../src/utils/email/transporter");

import transporter from "../../../../src/utils/email/transporter";

describe("transporter.ts", () => {
  it("should be a configured transporter", () => {
    expect(transporter).toBeDefined();
    expect(typeof transporter.sendMail).toBe("function");
  });
});
