import { NextApiResponse, NextApiRequest } from "next";
import axios from "axios";

const route = "https://frontend-take-home-service.fetch.com/dogs/search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Method not allowed", message: "Must use GET method" });
  }

  const {
    breeds,
    zipCodes,
    ageMin,
    ageMax,
    size = 25,
    from = 0,
    sort,
  } = req.query;

  try {
    const cookies = req.headers.cookie;

    if (!cookies) {
      return res.status(401).json({
        error: "You are not authenticated",
        message: "Cookies were not received",
      });
    }

    const params: Record<string, any> = {
      size: size as string,
      from: from as string,
    };
    if (breeds) {
      if (Array.isArray(breeds)) {
        params.breeds = breeds;
      } else if (typeof breeds === "string") {
        // Handle comma-separated breed strings
        const breedsArray = breeds.split(",").map((breed) => breed.trim());
        params.breeds = breedsArray;
      }
    }
    if (zipCodes)
      params.zipCodes = Array.isArray(zipCodes)
        ? zipCodes
        : zipCodes
        ? [zipCodes]
        : undefined;
    if (ageMin) params.ageMin = ageMin as string;
    if (ageMax) params.ageMax = ageMax as string;
    if (sort) params.sort = sort as string;

    const response = await axios.get(route, {
      params: params,
      headers: {
        Cookie: cookies,
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(error.response?.status || 500).json({
      error: "Failed to fetch search results from external service",
      message:
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Unknown error",
    });
  }
}
