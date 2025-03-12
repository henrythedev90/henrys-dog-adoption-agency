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

  const { zipCodes } = req.body;

  try {
    const response = await axios.post(URL_ROUTE, zipCodes, {
      withCredentials: true,
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not fetch the zip codes locations" });
  }
}
