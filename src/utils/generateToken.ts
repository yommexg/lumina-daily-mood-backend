import crypto from "crypto";
import VerificationToken from "../models/VerificationToken";

export const generateVerificationToken = async (userId: string) => {
  const token = crypto.randomBytes(32).toString("hex");

  await VerificationToken.findOneAndDelete({ userId }); // Invalidate old token

  await VerificationToken.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  return token;
};
