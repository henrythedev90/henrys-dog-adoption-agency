import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/dogs/breeds";
const URL_ROUTE = `${url}${route}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).end();
  }

  try {
    const cookies = req.headers.cookie;
    if (!cookies) {
      res.status(401).json({
        error: "No authentication cookie was found",
      });
    }
    const response = await axios.get(URL_ROUTE, {
      withCredentials: true,
      headers: { Cookie: cookies, "Content-Type": "application/json" },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching dog breeds:", error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        error: `Failed to find the breeds. Status: ${error.response.status}`,
      });
    }

    // Handle general error if no response is available
    return res.status(500).json({ error: "Failed to find the breeds" });
  }
}
