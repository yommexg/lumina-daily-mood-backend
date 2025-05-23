import { Request, Response } from "express";
import VerificationToken from "../../models/VerificationToken";
import User from "../../models/User";
import { sendPushNotification } from "../../utils/pushNotifications";

export const handleVerifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res
      .status(400)
      .json({ success: false, message: "Token missing or invalid" });
    return;
  }

  try {
    const existingToken = await VerificationToken.findOne({ token });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      res
        .status(400)
        .json({ success: false, message: "Token expired or invalid" });
      return;
    }

    const user = await User.findById(existingToken.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    await VerificationToken.deleteOne({ _id: existingToken._id });

    if (user.expoPushToken) {
      sendPushNotification({
        pushTokens: [user.expoPushToken],
        title: "✅ Account Verified Successfully",
        body: "Your account has been verified!. You may now sign in to your account.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Email successfully verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
