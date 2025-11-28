import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "https://app.chatting.nav-code.com/api"
      : "https://app.chatting.nav-code.com/api",
  withCredentials: true,
});
