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
import { sendPushNotification } from "../../utils/pushNotifications";

export const handleRegisterUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: "No Request Body found" });
    return;
  }

  const { name, email, password, expoPushToken } = req.body;

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
      existingUser.expoPushToken = expoPushToken;
      existingUser.avatar = undefined;
      existingUser.googleId = undefined;
      await existingUser.save();

      // Generate new token
      const token = await generateVerificationToken(
        existingUser._id.toString()
      );
      await sendVerificationEmail(email, capitalizeFirstLetter(name), token);

      res
        .status(201)
        .json({ success: true, message: "Email verification sent" });
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      expoPushToken,
      isVerified: false,
    });

    const token = await generateVerificationToken(newUser._id.toString());
    await sendVerificationEmail(email, capitalizeFirstLetter(name), token);
    if (expoPushToken) {
      sendPushNotification({
        pushTokens: [expoPushToken],
        title: "Verify Your Email",
        body: `A verification email has been sent to ${email}. Please check your inbox — and don't forget to check your spam folder just in case!`,
      });
    }

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

  const { name, email, avatar, googleId, expoPushToken } = req.body;

  if (!email || !googleId) {
    res.status(400).json({ success: false, message: "Incomplete Details" });
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
      existingUser.googleId = googleId;
      existingUser.expoPushToken = expoPushToken;
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
        .status(201)
        .json({ success: true, message: "Email verification sent" });
      return;
    }

    const newUser = await User.create({
      name: userName,
      email,
      googleId,
      avatar,
      expoPushToken,
      isVerified: false,
    });

    const token = await generateVerificationToken(newUser._id.toString());
    await sendVerificationEmail(email, capitalizeFirstLetter(userName), token);

    if (expoPushToken) {
      sendPushNotification({
        pushTokens: [expoPushToken],
        title: "Verify Your Email",
        body: `A verification email has been sent to ${email}. Please check your inbox — and don't forget to check your spam folder just in case!`,
      });
    }

    res.status(201).json({ success: true, message: "Email verification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
