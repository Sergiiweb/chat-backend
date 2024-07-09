import { config } from "dotenv";

config();

export const configs = {
  DB_URI: process.env.DB_URI,
  PORT: process.env.PORT || 5000,
  FRONT_URL: process.env.FRONT_URL || "http://0.0.0.0:3000",

  SECRET_SALT: process.env.SECRET_SALT || 7,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "your_jwt_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACTIVATE_SECRET: process.env.JWT_ACTIVATE_SECRET,
  JWT_FORGOT_SECRET: process.env.JWT_FORGOT_SECRET,
};
