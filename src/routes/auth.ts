import express from "express";
import { handleRegisterUser } from "../controllers/auth/register";
import { handleVerifyEmail } from "../controllers/auth/verifyEmail";

const authRouter = express.Router();

authRouter.post("/register", handleRegisterUser);
authRouter.get("/verify-email", handleVerifyEmail);

export default authRouter;
