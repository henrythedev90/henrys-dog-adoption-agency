import { NextApiResponse, NextApiRequest } from "next";
import { apiClient } from "@/services/apiClient";

const route = "/dogs/search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API Route: Received request for dog search breed");

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
    sort = ["breed:asc"],
  } = req.query;

  try {
    const cookies = req.headers.cookie;

    console.log("Cookies received:", cookies ? "Yes" : "No");

    if (!cookies) {
      return res.status(401).json({
        error: "You are not authenticated",
        message: "Cookies were not received",
      });
    }
    const queryParams = new URLSearchParams();

    if (breeds) {
      const breedArray = Array.isArray(breeds) ? breeds : [breeds];
      breedArray.forEach((breed) => queryParams.append("breeds", breed));
    }

    if (zipCodes) {
      const zipCodesArray = Array.isArray(zipCodes) ? zipCodes : [zipCodes];
      zipCodesArray.forEach((zipCode) =>
        queryParams.append("zipCodes", zipCode)
      );
    }

    if (ageMin) queryParams.append("ageMin", ageMin as string);
    if (ageMax) queryParams.append("ageMax", ageMax as string);
    if (size) queryParams.append("size", size as string);
    if (from) queryParams.append("from", from as string);
    if (sort) queryParams.append("sort", sort as string);

    console.log(
      "Starting making request to search breed with the params of",
      queryParams
    );

    const response = await apiClient.get(
      `${route}/?${queryParams.toString()}`,
      {
        headers: {
          Cookie: cookies,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch the search queries",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
