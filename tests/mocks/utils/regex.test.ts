import {
  isEmailValid,
  isPasswordValid,
  getUsernameFromEmail,
} from "../../../src/utils/regex";

describe("Regex Utilities", () => {
  test("validates email correctly", () => {
    expect(isEmailValid("test@example.com")).toBe(true);
    expect(isEmailValid("bad-email")).toBe(false);
  });

  test("validates password strength correctly", () => {
    expect(isPasswordValid("Password123!")).toBe(true);
    expect(isPasswordValid("weak")).toBe(false);
  });

  test("extracts username from email correctly", () => {
    expect(getUsernameFromEmail("user@example.com")).toBe("user");
  });
});
