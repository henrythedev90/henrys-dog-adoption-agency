import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return res.status(401).json({ error: "You are not authorize" });
  }
  return res.status(200).json({
    success: true,
    message: "Your cookies are still in use",
    cookie: cookies,
  });
}
