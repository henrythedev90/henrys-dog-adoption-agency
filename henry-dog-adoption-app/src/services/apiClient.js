import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://frontend-take-home-service.fetch.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      console.log(document.cookie);
      const token = document.cookie
        .split("fetch-access-token=")[1]
        .split(";")[0];
      if (token) {
        config.headers.Cookie = `fetch-access-token=${token}`;
      }
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
