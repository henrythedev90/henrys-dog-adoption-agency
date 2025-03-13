import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/auth/logout";
const URL_ROUTE = `${url}${route}`;

export default async function helper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }
  try {
    const cookies = req.headers.cookie;
    await axios.post(
      URL_ROUTE,
      {},
      {
        withCredentials: true,
        headers: {
          Cookie: cookies,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json({ success: true, message: "You are now logged out" });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Error response from external service:",
        error.response.data
      );
      return res.status(500).json({
        error: `Failed to get the match: ${
          error.response.data.message || error.message
        }`,
      });
    } else {
      // Handle cases where the error is not related to the response, like network issues
      console.error(
        "Error in request or network issue:",
        (error as Error).message
      );
      return res.status(500).json({
        error: `Failed to get the match: ${(error as Error).message}`,
      });
    }
  }
}
