import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "../../../lib/apiClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { favoriteIds } = req.body;

    if (!favoriteIds || !Array.isArray(favoriteIds)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const response = await apiClient.post("/dogs/match", { favoriteIds });
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error in match API route:", error);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
}
