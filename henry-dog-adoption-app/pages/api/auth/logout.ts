import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/services/apiClient";

const route = "/auth/logout";

export default async function helper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("User is now trying to logout");
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method is not allowed",
      message: "Must use POST method",
    });
  }
  try {
    const cookies = req.headers.cookie;
    await apiClient.post(
      route,
      {},
      {
        headers: {
          Cookie: cookies,
        },
      }
    );
    res.status(200).json({ success: true, message: "You are now logged out" });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to find to logout",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
