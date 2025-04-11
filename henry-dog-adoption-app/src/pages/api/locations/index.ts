import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/lib/apiClient";

const route = "/locations";

export default async function helper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method used is not allowed",
      message: "Must use POST method",
    });
  }
  let cookies = req.headers.cookie;

  console.log("Cookies received:", cookies ? "Yes" : "No");

  if (!cookies) {
    return res.status(401).json({ error: "You are not authorize" });
  }
  const zipCodes = req.body;

  if (!Array.isArray(zipCodes)) {
    return res.status(400).json({
      error: "Expected zipCodes to be an array of zip code strings",
      message: "Please enter zipcode",
    });
  }

  try {
    const response = await apiClient.post(route, zipCodes, {
      headers: {
        Cookie: cookies,
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle general error if no response is available
    return res.status(500).json({
      error: "Failed to find the location",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
