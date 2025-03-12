import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/locations/search";
const URL_ROUTE = `${url}${route}`;

export default async function helper(
  res: NextApiResponse,
  req: NextApiRequest
) {
  if (req.method !== "POST") return res.status(405).end();

  const { city, states, geoBoundingBox, size = 25, from = 0 } = req.query;

  try {
    const cookies = req.headers.cookie;
    if (!cookies) {
      return res.status(401).json({ error: "You are not authorized" });
    }
    const response = await axios.post(
      URL_ROUTE,
      { city, states, geoBoundingBox, size, from },
      { withCredentials: true }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to search location" });
  }
}
