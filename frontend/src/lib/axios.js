import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "https://careful-jayme-psit-84f63ed1.koyeb.app/api"
      : "https://careful-jayme-psit-84f63ed1.koyeb.app/api",
  withCredentials: true,
});
