import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const route = "https://frontend-take-home-service.fetch.com/dogs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API Route: Received request to get dogs by dogs id");
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "This method is not allowed",
      message: "Must use the POST method",
    });
  }
  try {
    const cookies = req.headers.cookie;

    console.log("Cookies received:", cookies ? "Yes" : "No");

    if (!cookies) {
      return res.status(401).json({
        error: "You do have access because you are not authenticated",
        message: "Cookies are missing",
      });
    }

    const dogIds = req.body;

    if (dogIds.length > 100) {
      return res.status(400).json({
        error: "Too many dogs are being sent",
        message: "Please use 100 dogs or less.",
      });
    } else if (!Array.isArray(dogIds)) {
      return res.status(400).json({
        error: "There are no dogs here",
        message: "Please add at least 1 dogs",
      });
    }

    const response = await axios.post(route, dogIds, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch the dog id's",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
