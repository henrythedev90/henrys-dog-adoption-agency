import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/lib/apiClient";

const route = "/dogs/match";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API Route: Received request for dog match");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Incorrect method used",
        message: "Must use the POST method",
      });
    }

    let cookies = req.headers.cookie;
    console.log("Cookies received:", cookies ? "Yes" : "No");
    if (!cookies) {
      return res.status(401).json({
        error: "You are not authorize",
        message: "Cookies were not found",
      });
    }

    const favoriteDogIds = req.body;

    // Ensure the body is an array of strings
    if (
      !Array.isArray(favoriteDogIds) ||
      !favoriteDogIds.every((id) => typeof id === "string")
    ) {
      return res.status(400).json({
        error: "Expected an array of dog IDs as strings",
        message: "Could not find the array of Dod ID's",
      });
    }
    const response = await apiClient.post(route, favoriteDogIds, {
      headers: {
        Cookie: cookies,
      },
    });
    console.log("API request successful");
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle general error if no response is available
    return res.status(500).json({
      error: "Failed to find your match",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
