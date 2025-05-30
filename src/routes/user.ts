import express from "express";
import { handleGetUserDetails } from "../controllers/user/getUser";

const userRouter = express.Router();

userRouter.get("/details", handleGetUserDetails);

export default userRouter;
