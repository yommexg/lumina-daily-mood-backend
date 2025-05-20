import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import connectDB from "./config/dbConect";
import authRouter from "./routes/auth";
import { errorEvent, logEvent } from "./middlewares/events";

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT;

app.use(logEvent);

app.get("/", (_req, res) => {
  res.send("Hello World with TypeScript + Node!");
});

app.use("/api/auth", authRouter);

app.use(errorEvent);

mongoose.connection.once("open", () => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
