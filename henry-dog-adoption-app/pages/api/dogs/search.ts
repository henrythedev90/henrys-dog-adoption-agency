import { NextApiResponse, NextApiRequest } from "next";
import axios from "axios";

const url = "https://frontend-take-home-service.fetch.com";
const route = "/dogs/search";
const URL_ROUTE = `${url}${route}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
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
    if (!cookies) {
      return res.status(401).json({ error: "You are not authenticated" });
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

    const response = await axios.get(`${URL_ROUTE}?${queryParams.toString()}`, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to search dogs",
    });
  }
}
