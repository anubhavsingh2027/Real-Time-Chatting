import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV || "development";

// Get Client URL based on NODE_ENV
const CLIENT_URL =
  NODE_ENV === "production"
    ? process.env.FRONTEND_PRODUCTION_URL
    : process.env.FRONTEND_DEVELOPMENT_URL;

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: NODE_ENV,
  CLIENT_URL: CLIENT_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,
  REDIS_URL: process.env.REDIS_URL,
  BACKEND_PRODUCTION_URL: process.env.BACKEND_PRODUCTION_URL,
  BACKEND_DEVELOPMENT_URL: process.env.BACKEND_DEVELOPMENT_URL,
  FRONTEND_PRODUCTION_URL: process.env.FRONTEND_PRODUCTION_URL,
  FRONTEND_DEVELOPMENT_URL: process.env.FRONTEND_DEVELOPMENT_URL,
};
