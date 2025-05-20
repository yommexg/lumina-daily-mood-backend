import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/dbConect";
import mongoose from "mongoose";

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT;

app.get("/", (_req, res) => {
  res.send("Hello World with TypeScript + Node!");
});

mongoose.connection.once("open", () => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
