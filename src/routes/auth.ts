import express from "express";

import {
  handleRegisterUser,
  handleRegisterUserWithGoogle,
} from "../controllers/auth/register";
import { handleVerifyEmail } from "../controllers/auth/verifyEmail";
import {
  handleLoginUser,
  handleLoginWithGoogle,
} from "../controllers/auth/login";

const authRouter = express.Router();

authRouter.post("/register", handleRegisterUser);
authRouter.post("/register-with-google", handleRegisterUserWithGoogle);

authRouter.get("/verify-email", handleVerifyEmail);

authRouter.post("/login", handleLoginUser);
authRouter.post("/login-with-google", handleLoginWithGoogle);

export default authRouter;
