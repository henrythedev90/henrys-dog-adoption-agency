import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/auth/login";
const URL_ROUTE = url + route;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }

  const { name, email } = req.body;

  if (!email || !name) {
    return res
      .status(400)
      .json({ message: "Email and/or password are required" });
  }

  try {
    await axios.post(URL_ROUTE, { name, email }, { withCredentials: true });
    res
      .status(200)
      .json({ success: true, message: "I hope you find your dog" });
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate" });
  }
}
