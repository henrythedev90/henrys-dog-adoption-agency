import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    console.log("Auth check: Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie;

  if (!cookies) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.status(200).json({
    success: true,
    message: "Cookies are present",
  });
}
