import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  if (process.env.NODE_ENV === "test") return;

  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(process.env.DATABASE_URI!);
    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

export default connectDB;
