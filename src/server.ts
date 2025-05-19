import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get("/", (_req, res) => {
  res.send("Hello World with TypeScript + Node!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
