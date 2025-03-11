import axios from "axios";
import { Content } from "next/font/google";

const api = axios.create({
  baseURL: "https://frontend-take-home-service.fetch.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// export const login = async (credentials) => {
//     const response = axios.post("/")
// };
