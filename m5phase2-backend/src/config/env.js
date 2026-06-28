import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/M5phase2DB",
};
