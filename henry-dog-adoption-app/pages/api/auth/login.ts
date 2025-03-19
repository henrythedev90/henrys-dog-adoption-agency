import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/lib/apiClient";

const route = "/auth/login";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }

  const { name, email } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message: "Please enter a valid email",
    });
  }

  if (!name) {
    return res.status(400).json({ message: "Please enter a valid name" });
  }

  try {
    const response = await apiClient.post(route, { name, email });

    //setting up the cookies
    const cookie = response.headers["set-cookie"];
    if (cookie) {
      cookie.forEach((token: string) => {
        res.setHeader("Set-Cookie", token);
      });
    }

    res.status(200).json({
      success: true,
      message: "I hope you find your dog",
      data: response.data,
    });
  } catch (error) {
    // Handle general error if no response is available
    return res.status(500).json({
      error: "Failed to login",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
