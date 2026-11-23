import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "screenbox_jwt_default_secret_dev",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  cookieName: "sb_token",
  jwtExpiresIn: "7d",
};
