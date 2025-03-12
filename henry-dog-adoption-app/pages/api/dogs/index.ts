import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/dogs";
const URL_ROUTE = `${url}${route}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const cookies = req.headers.cookie;
  if (!cookies) {
    return res
      .status(401)
      .json({ error: "You do have access because you are not authenticated" });
  }

  const { dogIds } = req.body;

  try {
    const response = await axios.post(URL_ROUTE, dogIds, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the dog details" });
  }
}
