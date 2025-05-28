import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "This method is not allowed",
      message: "Must use the POST method",
    });
  }

  try {
    const dogIds = req.body;

    if (dogIds.length > 100) {
      return res.status(400).json({
        error: "Too many dogs are being sent",
        message: "Please use 100 dogs or less.",
      });
    } else if (!Array.isArray(dogIds)) {
      return res.status(400).json({
        error: "There are no dogs here",
        message: "Please add at least 1 dogs",
      });
    }

    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Find dogs by their _id
    const dogs = await db
      .collection("dogs")
      .find({ _id: { $in: dogIds } })
      .toArray();

    return res.status(200).json(dogs);
  } catch (error) {
    console.error("Error fetching dogs from MongoDB:", error);
    return res.status(500).json({
      error: "Failed to fetch the dogs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
