import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Example: Adding Authorization header

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Request being made to: ${config.baseURL}${config.url}`);
    console.log(`Request method: ${config.method}`);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error("API Error Details:");
    if (axios.isAxiosError(error)) {
      console.error("Request URL:", error.config?.url);
      console.error("Request Method:", error.config?.method);
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error("Response Data:", error.response?.data);
    } else {
      console.error("Non-Axios Error:", error);
    }
    return Promise.reject(error);
  }
);
