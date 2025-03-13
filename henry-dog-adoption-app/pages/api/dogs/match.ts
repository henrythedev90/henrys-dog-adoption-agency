import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/dogs/match";
const URL_ROUTE = `${url}${route}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Incorrect method used" });
  }

  let cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: "You are not authorize" });
  }

  const favoriteDogIds = req.body;

  // Ensure the body is an array of strings
  if (
    !Array.isArray(favoriteDogIds) ||
    !favoriteDogIds.every((id) => typeof id === "string")
  ) {
    return res.status(400).json({
      error: "Expected an array of dog IDs as strings",
    });
  }
  try {
    const response = await axios.post(URL_ROUTE, favoriteDogIds, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    // Check if error has a response and log more detailed info
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Error response from external service:",
        error.response.data
      );
      return res.status(500).json({
        error: `Failed to get the match: ${
          error.response.data.message || error.message
        }`,
      });
    } else {
      // Handle cases where the error is not related to the response, like network issues
      console.error(
        "Error in request or network issue:",
        (error as Error).message
      );
      return res.status(500).json({
        error: `Failed to get the match: ${(error as Error).message}`,
      });
    }
  }
}
