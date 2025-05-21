import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../../models/User";
import { generateVerificationToken } from "../../utils/generateToken";
import { sendVerificationEmail } from "../../utils/email/sendVerification";
import {
  getUsernameFromEmail,
  isEmailValid,
  isPasswordValid,
} from "../../utils/regex";
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

  if (!isEmailValid(email)) {
    res.status(400).json({ success: false, message: "Invalid Email" });
    return;
  }

  if (!isPasswordValid(password)) {
    res.status(400).json({ success: false, message: "Weak Password" });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        res
          .status(409)
          .json({ success: false, message: "User already exists" });
        return;
      }

      // Update password & name if re-registering
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.name = name;
      existingUser.avatar = undefined;
      await existingUser.save();

      // Generate new token
      const token = await generateVerificationToken(
        existingUser._id.toString()
      );
      await sendVerificationEmail(email, capitalizeFirstLetter(name), token);

      res
        .status(200)
        .json({ success: true, message: "Email verification sent" });
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

    res.status(201).json({ success: true, message: "Email verification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const handleRegisterUserWithGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: "No Request Body found" });
    return;
  }

  const { name, email, avatar } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is Required" });
    return;
  }
  const userName = name ?? getUsernameFromEmail(email);

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        res
          .status(409)
          .json({ success: false, message: "User already exists" });
        return;
      }

      existingUser.name = userName;
      existingUser.avatar = avatar;
      existingUser.password = undefined;
      await existingUser.save();

      // Generate new token
      const token = await generateVerificationToken(
        existingUser._id.toString()
      );
      await sendVerificationEmail(
        email,
        capitalizeFirstLetter(userName),
        token
      );

      res
        .status(200)
        .json({ success: true, message: "Email verification sent" });
      return;
    }

    const newUser = await User.create({
      name: userName,
      email,
      isVerified: false,
    });

    const token = await generateVerificationToken(newUser._id.toString());
    await sendVerificationEmail(email, capitalizeFirstLetter(userName), token);

    res.status(201).json({ success: true, message: "Email verification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
