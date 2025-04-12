import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://frontend-take-home-service.fetch.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Example: Adding Authorization header

apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `Request being made to: <span class="math-inline">\{config\.baseURL\}</span>{config.url}`
    );
    console.log(`Request method: ${config.method}`);

    // Only try to access localStorage in the browser
    if (typeof window !== "undefined") {
      console.log("Running in browser environment");
      const auth = localStorage.getItem("auth");
      if (auth) {
        const { token } = JSON.parse(auth);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log("Running in server environment");
    }

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
      console.error("Headers:", error.config?.headers);
    } else {
      console.error("Non-Axios Error:", error);
    }
    return Promise.reject(error);
  }
);
