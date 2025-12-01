import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API call error:", error);
    return Promise.reject(error);
  }
);