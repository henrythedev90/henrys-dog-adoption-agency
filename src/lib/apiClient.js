import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Skip token refresh for auth-related endpoints
    const isAuthEndpoint = config.url?.includes("/auth/");
    if (!isAuthEndpoint) {
      // Check if we need to refresh the token
      const hasAccessToken = document.cookie.includes("accessToken=");
      const hasRefreshToken = document.cookie.includes("refreshToken=");

      if (!hasAccessToken && hasRefreshToken) {
        // The middleware will handle token refresh
        console.log("Access token missing, middleware will handle refresh...");
      }
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error)) {
      const { config, response } = error;

      // Handle token-related errors
      if (response?.status === 401) {
        const isAuthEndpoint = config?.url?.includes("/auth/");

        if (!isAuthEndpoint) {
          // Check if we have a refresh token
          const hasRefreshToken = document.cookie.includes("refreshToken=");

          if (hasRefreshToken) {
            // The middleware will handle token refresh
            console.log("Token expired, middleware will handle refresh...");
            // Retry the original request after middleware refreshes token
            return apiClient(config);
          } else {
            // No refresh token, redirect to root path
            window.location.href = "/";
            return Promise.reject(error);
          }
        }
      }

      // Log other errors
      console.error("API Error:", {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        data: response?.data,
      });
    }

    return Promise.reject(error);
  }
);
