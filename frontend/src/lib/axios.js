import axios from "axios";

const nodeEnv = import.meta.env.VITE_NODE_ENV || "development";
const baseURL =
  nodeEnv === "production"
    ? import.meta.env.VITE_BACKEND_PRODUCTION_URL
    : import.meta.env.VITE_BACKEND_DEVELOPMENT_URL;

export const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});
