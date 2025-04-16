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
    // Get the raw cookie header
    const cookieHeader = req.headers.cookie;
    console.log("Logout API: Raw cookie header present:", !!cookieHeader);

    // Forward the cookies from the client request to the Fetch API
    const fetchApiToken = req.cookies["fetch-api-token"];
    const fetchRefreshToken = req.cookies["fetch-refresh-token"];

    console.log("Logout API: Cookie values:", {
      fetchApiToken: fetchApiToken ? "exists" : "missing",
      fetchRefreshToken: fetchRefreshToken ? "exists" : "missing",
    });

    if (!fetchApiToken && !fetchRefreshToken) {
      console.log("Logout API: No authentication cookies found");
      // Even if cookies are missing, clear any that might exist and consider it a successful logout
      res.setHeader("Set-Cookie", [
        "fetch-api-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
        "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      ]);
      return res
        .status(200)
        .json({ message: "Logged out successfully (no cookies)" });
    }

    // Call the backend logout endpoint with the auth cookies
    try {
      console.log("Logout API: Attempting to call Fetch API logout endpoint");

      // Use the raw cookie header if available, otherwise construct it
      const cookieToSend =
        cookieHeader || (fetchApiToken && fetchRefreshToken)
          ? `fetch-api-token=${fetchApiToken}; fetch-refresh-token=${fetchRefreshToken}`
          : "";

      // Try with direct cookie header approach
      await axios.post(
        "https://frontend-take-home-service.fetch.com/auth/logout",
        {},
        {
          headers: {
            Cookie: cookieToSend,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Logout API: Fetch API logout successful");
    } catch (fetchError: any) {
      console.error(
        "Logout API: Error calling Fetch API:",
        fetchError.message,
        fetchError.response?.status
      );

      // If it's not a 401, rethrow to be handled by the outer catch
      if (fetchError.response?.status !== 401) {
        throw fetchError;
      }

      console.log(
        "Logout API: Got 401 from Fetch API - treating as already logged out"
      );
    }

    // Clear the cookies by setting them to expire
    res.setHeader("Set-Cookie", [
      "fetch-api-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
    ]);

    console.log("Logout API: Cookies cleared, returning success");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout API: Error in logout API route:", error.message);

    // Always clear cookies on error - better to log the user out client-side
    res.setHeader("Set-Cookie", [
      "fetch-api-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
    ]);

    // Return 200 always - we want the client to consider the user logged out
    return res.status(200).json({
      message: "Logged out (with server error)",
      error: error.message,
    });
  }
}
