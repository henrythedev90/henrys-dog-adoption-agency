import axios from "axios";
import { Content } from "next/font/google";

const api = axios.create({
  baseURL: "https://frontend-take-home-service.fetch.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (responce) => responce,
  (error) => {
    if (error.responce && error.responce.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (name: string, email: string) => {
    const responce = await api.post("/auth/login", { name, email });
    return responce.data;
  },

  logout: async () => {
    const responce = await api.post("/auth/logout");
    return responce.data;
  },
};
