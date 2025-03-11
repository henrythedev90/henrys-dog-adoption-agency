import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/auth/logout";
const URL_ROUTE = url + route;

export default async function helper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }
  try {
    await axios.post(URL_ROUTE, { withCredentials: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to logout" });
  }
}
