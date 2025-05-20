import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import User from "../../models/User";
import { generateVerificationToken } from "../../utils/generateToken";
import { sendVerificationEmail } from "../../utils/email/sendVerification";
import { isPasswordValid } from "../../utils/passwordRegex";
import { capitalizeFirstLetter } from "../../utils/email/capitalizeLetter";

export const handleRegisterUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: "No Request Body found" });
  } else {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Missing User Details" });
      return;
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res
          .status(400)
          .json({ success: false, message: "User already exists" });
        return;
      }

      if (!isPasswordValid(password)) {
        res.status(400).json({ success: false, message: "Weak Password" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      });

      const capitalizedUserName = capitalizeFirstLetter(name);

      const token = generateVerificationToken(user._id.toString());
      await sendVerificationEmail(email, capitalizedUserName, token);

      res
        .status(201)
        .json({ success: true, message: "Verification Link Sent" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};
