import { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

const PRO_FRONTEND_URL = process.env.PRO_FRONTEND_URL!;
const DEV_FRONTEND_URL = process.env.DEV_FRONTEND_URL!;

const allowedOrigins = [PRO_FRONTEND_URL, DEV_FRONTEND_URL];

const isAllowedOrigin = (origin: string | undefined): boolean => {
  return allowedOrigins.includes(origin as string);
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
