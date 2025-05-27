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

    // Log the database name and collection
    console.log("Connected to database:", db.databaseName);
    console.log("Available collections:", await db.listCollections().toArray());

    // Get unique breeds from the dogs collection
    const breeds = await db.collection("dogs").distinct("breed");
    console.log("Raw breeds from MongoDB:", breeds);

    // Sort breeds alphabetically
    const sortedBreeds = breeds.sort((a: string, b: string) =>
      a.localeCompare(b)
    );
    console.log("Sorted breeds:", sortedBreeds);

    return res.status(200).json(sortedBreeds);
  } catch (error) {
    console.error("Error fetching breeds from MongoDB:", error);
    return res.status(500).json({
      error: "Failed to fetch breeds",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
