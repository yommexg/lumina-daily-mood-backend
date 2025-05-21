import express from "express";
import {
  handleRegisterUser,
  handleRegisterUserWithGoogle,
} from "../controllers/auth/register";
import { handleVerifyEmail } from "../controllers/auth/verifyEmail";

const authRouter = express.Router();

authRouter.post("/register", handleRegisterUser);
authRouter.post("/register-with-google", handleRegisterUserWithGoogle);
authRouter.get("/verify-email", handleVerifyEmail);

export default authRouter;
