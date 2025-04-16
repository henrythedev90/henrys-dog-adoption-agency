import { NextApiResponse, NextApiRequest } from "next";
import axios from "axios";

const route = "https://frontend-take-home-service.fetch.com/dogs/search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API Route: /api/dogs/search received request");

  // Debug the actual request received
  console.log("Request query:", JSON.stringify(req.query));
  console.log("Request body:", JSON.stringify(req.body));

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

    console.log("Search API: Cookies received:", cookies ? "Yes" : "No");

    if (!cookies) {
      console.error("Search API: Authentication cookies missing.");
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
        console.log("Search API: Breeds parameter is an array:", breeds);
      } else if (typeof breeds === "string") {
        // Handle comma-separated breed strings
        const breedsArray = breeds.split(",").map((breed) => breed.trim());
        params.breeds = breedsArray;
        console.log(
          "Search API: Breeds parameter is a comma-separated string:",
          breedsArray
        );
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
    if (sort) {
      params.sort = sort as string;
      console.log("Search API: Using sort parameter:", params.sort);
    } else {
      console.log(
        "Search API: No sort parameter provided, using external API default."
      );
    }

    console.log("Search API: Calling apiClient with params:", params);

    // Add detailed debugging for the URL that will be sent
    console.log(
      "Search API: Full URL with params that will be sent:",
      route +
        "?" +
        Object.entries(params)
          .map(([key, val]) => {
            if (Array.isArray(val)) {
              return `${key}=${encodeURIComponent(val.join(","))}`;
            }
            return `${key}=${encodeURIComponent(val as string)}`;
          })
          .join("&")
    );

    const response = await axios.get(route, {
      params: params,
      headers: {
        Cookie: cookies,
      },
    });

    console.log(
      "Search API: Received response from apiClient, status:",
      response.status
    );
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Search API: Error calling external API via apiClient:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      params: error.config?.params,
    });
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
