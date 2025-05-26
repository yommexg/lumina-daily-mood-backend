import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Mock transporter globally
jest.mock("./src/utils/email/transporter", () => ({
  __esModule: true,
  default: {
    sendMail: jest.fn(),
  },
}));

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear DB after each test
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }

  // Also clear mocks after each test
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});
