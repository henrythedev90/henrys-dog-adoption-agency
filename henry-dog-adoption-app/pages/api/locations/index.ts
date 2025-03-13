import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/locations";
const URL_ROUTE = `${url}${route}`;

export default async function helper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  let cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: "You are not authorize" });
  }
  const zipCodes = req.body;

  if (!Array.isArray(zipCodes)) {
    return res.status(400).json({
      error: "Expected zipCodes to be an array of zip code strings",
    });
  }

  try {
    const response = await axios.post(URL_ROUTE, zipCodes, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not fetch the zip codes locations" });
  }
}
