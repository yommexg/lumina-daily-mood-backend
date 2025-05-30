import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (token == null) {
    res
      .status(401)
      .json({ success: false, message: "Authentictaion Token Required" });
    return;
  }

  try {
    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ success: false, message: "Invalid Auth Token" });
        return;
      }

      //@ts-ignore
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default verifyAuthToken;
