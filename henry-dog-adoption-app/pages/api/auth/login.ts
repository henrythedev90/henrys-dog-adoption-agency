import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const route = "https://frontend-take-home-service.fetch.com/auth/login";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("Login API: Invalid method:", req.method);
    return res.status(405).json({ error: "Method is not allowed" });
  }

  const { name, email } = req.body;

  if (!email || !emailRegex.test(email)) {
    console.log("Login API: Invalid email:", email);
    return res.status(400).json({
      message: "Please enter a valid email",
    });
  }

  if (!name) {
    console.log("Login API: Missing name");
    return res.status(400).json({ message: "Please enter a valid name" });
  }

  try {
    console.log("Login API: Attempting login for:", { name, email });

    // Make the login request directly to the Fetch API
    const response = await axios.post(
      route,
      { name, email },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // Get the cookies from the response
    const cookies = response.headers["set-cookie"];
    console.log(
      "Login API: Raw cookies from Fetch API:",
      cookies ? "Present" : "None"
    );

    if (cookies && cookies.length > 0) {
      // Log each cookie for debugging
      cookies.forEach((cookie: string, index: number) => {
        // Only show part of the cookie for security
        const cookieParts = cookie.split(";")[0].split("=");
        const cookieName = cookieParts[0];
        const cookieValuePreview = cookieParts[1]
          ? `${cookieParts[1].substring(0, 10)}...`
          : "[empty]";
        console.log(
          `Login API: Cookie ${index + 1}: ${cookieName}=${cookieValuePreview}`
        );
      });

      // Check specifically for fetch-api token
      const hasFetchApiToken = cookies.some((cookie: string) =>
        cookie.includes("fetch-api-token")
      );
      const hasFetchRefreshToken = cookies.some((cookie: string) =>
        cookie.includes("fetch-refresh-token")
      );

      console.log(`Login API: fetch-api-token present: ${hasFetchApiToken}`);
      console.log(
        `Login API: fetch-refresh-token present: ${hasFetchRefreshToken}`
      );

      // Forward each cookie exactly as received from the Fetch API
      res.setHeader("Set-Cookie", cookies);
      console.log("Login API: Forwarded cookies to client");
    } else {
      console.error("Login API: No cookies received from Fetch API");
      return res.status(401).json({
        error: "Authentication failed",
        message: "No authentication cookies received from server",
      });
    }

    console.log("Login API: Login successful for", name);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { name, email },
    });
  } catch (error: any) {
    console.error("Login API: Login failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers ? "Present" : "None",
    });

    return res.status(error.response?.status || 500).json({
      error: "Failed to login",
      message:
        error.response?.data?.message || error.message || "Unknown error",
    });
  }
}
