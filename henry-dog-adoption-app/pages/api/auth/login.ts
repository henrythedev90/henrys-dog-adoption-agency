import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie"; // Ensure the 'cookie' module is installed

const BASE_URL = "https://frontend-take-home-service.fetch.com";
const LOGIN_ROUTE = "/auth/login";
const URL_ROUTE = `${BASE_URL}${LOGIN_ROUTE}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }

  const { name, email } = req.body;

  if (!email || !name) {
    return res
      .status(400)
      .json({ message: "Email and/or password are required" });
  }

  try {
    const response = await axios.post(
      URL_ROUTE,
      { name, email },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const cookie = response.headers["set-cookie"];

    if (cookie) {
      cookie.forEach((token: string) => {
        res.setHeader("Set-Cookie", token);
      });
    }

    res.status(200).json({
      success: true,
      message: "I hope you find your dog",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate" });
    console.log(error, "this is error");
  }
}
