import { NextApiResponse, NextApiRequest } from "next";
import clientPromise from "@/lib/mongodb";

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
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Build MongoDB query
    const query: any = {};

    // Add breed filter
    if (breeds) {
      const breedsArray = Array.isArray(breeds)
        ? breeds
        : breeds.split(",").map((breed: string) => breed.trim());
      query.breed = { $in: breedsArray };
    }

    // Add zip code filter
    if (zipCodes) {
      const zipArray = Array.isArray(zipCodes)
        ? zipCodes
        : zipCodes.split(",").map((zip: string) => zip.trim());
      query.zip_code = { $in: zipArray };
    }

    // Add age range filter
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin as string);
      if (ageMax) query.age.$lte = parseInt(ageMax as string);
    }

    // Build sort object
    let sortObj: any = {};
    if (sort) {
      const [field, order] = (sort as string).split(":");
      sortObj[field] = order === "asc" ? 1 : -1;
    }

    // Execute query with pagination
    const dogs = await db
      .collection("dogs")
      .find(query)
      .sort(sortObj)
      .skip(parseInt(from as string))
      .limit(parseInt(size as string))
      .toArray();

    // Get total count for pagination
    const total = await db.collection("dogs").countDocuments(query);
    const fromNum = parseInt(from as string);
    const sizeNum = parseInt(size as string);

    // Extract IDs for the response
    const resultIds = dogs.map((dog) => dog._id);

    return res.status(200).json({
      resultIds,
      total,
      next: fromNum + sizeNum < total ? fromNum + sizeNum : undefined,
      prev: fromNum > 0 ? fromNum - sizeNum : undefined,
    });
  } catch (error: unknown) {
    console.error("Error searching dogs in MongoDB:", error);
    return res.status(500).json({
      error: "Failed to fetch search results",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
