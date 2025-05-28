import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    console.error(`Invalid method: ${req.method}`);
    return res.status(405).json({
      error: "Method is not allowed",
      message: "Must use GET method",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Get unique breeds from the dogs collection
    const breeds = await db.collection("dogs").distinct("breed");

    // Sort breeds alphabetically
    const sortedBreeds = breeds.sort((a: string, b: string) =>
      a.localeCompare(b)
    );
    return res.status(200).json(sortedBreeds);
  } catch (error) {
    console.error("Error fetching breeds from MongoDB:", error);
    return res.status(500).json({
      error: "Failed to fetch breeds",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
