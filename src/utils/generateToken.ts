import jwt from "jsonwebtoken";

export const generateVerificationToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });
};
