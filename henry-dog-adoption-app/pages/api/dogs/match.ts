import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/match";
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
  const { favoriteDogIds } = req.body;

  try {
    const response = await axios.post(URL_ROUTE, favoriteDogIds, {
      withCredentials: true,
      headers: {
        Cookies: cookies,
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get the match" });
  }
}
