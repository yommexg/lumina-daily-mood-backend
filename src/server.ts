import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";

import connectDB from "./config/dbConnect";
import corsOptions from "./config/corsOption";

import { errorEvent, logEvent } from "./middlewares/events";

import authRouter from "./routes/auth";
import verifyAuthToken from "./middlewares/verifyAuth";
import userRouter from "./routes/user";

dotenv.config();

const port = process.env.PORT;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors(corsOptions));

app.use(logEvent);

app.get("/", (_req, res) => {
  res.send("Hello World with TypeScript + Node!");
});

app.use("/api/auth", authRouter);

app.use(verifyAuthToken);
app.use("/api/user", userRouter);

app.use(errorEvent);

mongoose.connection.once("open", () => {
  app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`)
  );
});

export default app;
