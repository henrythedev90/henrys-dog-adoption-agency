import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/lib/apiClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Call the backend logout endpoint
    await apiClient.post("/auth/logout");

    // Clear the cookies by setting them to expire
    res.setHeader("Set-Cookie", [
      "fetch-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
      "fetch-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
    ]);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Error in logout API route:", error);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
}
