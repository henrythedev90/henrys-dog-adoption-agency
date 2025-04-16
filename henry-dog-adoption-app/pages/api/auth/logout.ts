import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Forward the cookies from the client request to the Fetch API
    const fetchAccessToken = req.cookies["fetch-access-token"];
    const fetchRefreshToken = req.cookies["fetch-refresh-token"];

    console.log("Cookie values:", {
      fetchAccessToken: fetchAccessToken ? "exists" : "missing",
      fetchRefreshToken: fetchRefreshToken ? "exists" : "missing",
    });

    if (!fetchAccessToken || !fetchRefreshToken) {
      console.log("No authentication cookies found");
      // Even if cookies are missing, clear any that might exist and consider it a successful logout
      res.setHeader("Set-Cookie", [
        "fetch-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
        "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      ]);
      return res
        .status(200)
        .json({ message: "Logged out successfully (no cookies)" });
    }

    // Call the backend logout endpoint with the auth cookies
    try {
      console.log("Attempting to call Fetch API logout endpoint");

      // Try with withCredentials approach
      await axios.post(
        "https://frontend-take-home-service.fetch.com/auth/logout",
        {},
        {
          withCredentials: true,
          headers: {
            Cookie: `fetch-access-token=${fetchAccessToken}; fetch-refresh-token=${fetchRefreshToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Fetch API logout successful");
    } catch (fetchError: any) {
      console.error(
        "Error calling Fetch API:",
        fetchError.message,
        fetchError.response?.status,
        fetchError.response?.data
      );

      // If it's not a 401, rethrow to be handled by the outer catch
      if (fetchError.response?.status !== 401) {
        throw fetchError;
      }

      console.log("Got 401 from Fetch API - treating as already logged out");
    }

    // Clear the cookies by setting them to expire
    res.setHeader("Set-Cookie", [
      "fetch-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
    ]);

    console.log("Cookies cleared, returning success");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Error in logout API route:", error.message);
    console.error("Full error:", error);

    // Always clear cookies on error - better to log the user out client-side
    res.setHeader("Set-Cookie", [
      "fetch-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
    ]);

    // Return 200 always - we want the client to consider the user logged out
    return res.status(200).json({
      message: "Logged out (with server error)",
      error: error.message,
    });
  }
}
