import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../../models/User";
import VerificationToken from "../../models/VerificationToken";
import { generateVerificationToken } from "../../utils/generateToken";
import { sendVerificationEmail } from "../../utils/email/sendVerification";
import { isPasswordValid } from "../../utils/passwordRegex";
import { capitalizeFirstLetter } from "../../utils/capitalizeLetter";

export const handleRegisterUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: "No Request Body found" });
    return;
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "Missing User Details" });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        res
          .status(400)
          .json({ success: false, message: "User already exists" });
        return;
      }

      if (!isPasswordValid(password)) {
        res.status(400).json({ success: false, message: "Weak Password" });
        return;
      }

      // Update password & name if re-registering
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.name = name;
      await existingUser.save();

      // Generate new token
      const token = await generateVerificationToken(
        existingUser._id.toString()
      );
      await sendVerificationEmail(email, capitalizeFirstLetter(name), token);

      res
        .status(200)
        .json({ success: true, message: "Verification link Sent" });
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const token = await generateVerificationToken(newUser._id.toString());
    await sendVerificationEmail(email, capitalizeFirstLetter(name), token);

    res.status(201).json({ success: true, message: "Verification link Sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
