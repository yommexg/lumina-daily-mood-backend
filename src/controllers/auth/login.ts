import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

import User from "../../models/User";
import { sendPushNotification } from "../../utils/pushNotifications";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleLoginUser = async (req: Request, res: Response) => {
  const { email, password, expoPushToken } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password required" });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid Email" });
      return;
    }

    if (user.googleId) {
      res.status(400).json({ success: false, message: "Use Google Sign-in" });
      return;
    }

    if (!user.password) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ success: false, message: "Account not verified" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid Password" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    if (expoPushToken !== null && user.expoPushToken !== null) {
      const loginTime = new Date().toLocaleString();

      const uniqueTokens = Array.from(
        new Set([user.expoPushToken, expoPushToken].filter(Boolean))
      );

      await sendPushNotification({
        pushTokens: uniqueTokens,
        title: "✅ Login Successful",
        body: `You logged in successfully on ${loginTime}. If this wasn't you, please secure your account immediately.`,
      });
    }

    if (expoPushToken && expoPushToken !== user.expoPushToken) {
      user.expoPushToken = expoPushToken;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const handleLoginWithGoogle = async (req: Request, res: Response) => {
  const { tokenId, expoPushToken } = req.body;

  if (!tokenId) {
    res.status(400).json({ success: false, message: "Google token missing" });
    return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { email } = payload;

    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "No account found. Register first." });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ success: false, message: "Account not verified" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    if (expoPushToken !== null && user.expoPushToken !== null) {
      const loginTime = new Date().toLocaleString();

      const uniqueTokens = Array.from(
        new Set([user.expoPushToken, expoPushToken].filter(Boolean))
      );

      await sendPushNotification({
        pushTokens: uniqueTokens,
        title: "✅ Login Successful",
        body: `You logged in successfully on ${loginTime}. If this wasn't you, please secure your account immediately.`,
      });
    }

    if (expoPushToken && expoPushToken !== user.expoPushToken) {
      user.expoPushToken = expoPushToken;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};
