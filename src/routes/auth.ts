import express from "express";
import { handleRegisterUser } from "../controllers/auth/register";

// import { handleGoogleLogin } from "../controllers/googleAuth.controller";

const authRouter = express.Router();

authRouter.post("/register", handleRegisterUser);
// router.post("/auth/google", handleGoogleLogin);

export default authRouter;
