import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/lib/apiClient";

const route = "/dogs/breeds";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API Route: Received request for dog breeds");

  if (req.method !== "GET") {
    console.error(`Invalid method: ${req.method}`);
    return res.status(405).json({
      error: "Method is not allowed",
      message: "Must use GET method",
    });
  }

  try {
    const cookies = req.headers.cookie;
    //checking if cookies were created
    console.log("Cookies received:", cookies ? "Yes" : "No");

    if (!cookies) {
      console.error("No cookies found in the request");
      return res.status(401).json({
        error: "Missing authentication",
        message: "Cookies are missing",
      });
    }

    console.log("Making request to dog breeds API");

    // Make the API request with cookies forwarded
    const response = await apiClient.get(route, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    });

    console.log("API request successful");
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle general error if no response is available
    return res.status(500).json({
      error: "Failed to find the breeds",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
