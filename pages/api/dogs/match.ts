import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { favoriteIds, userId } = req.body;
  console.log("Match API: Received request with:", { favoriteIds, userId });

  if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
    console.log(
      "Match API: Invalid request body - favoriteIds is not an array or is empty"
    );
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // If userId is provided, get existing matches
    let existingMatches: string[] = [];
    if (userId) {
      const matches = await db
        .collection("matches")
        .find({ userId })
        .project({ dogId: 1 })
        .toArray();
      existingMatches = matches.map((match) => match.dogId.toString());
    }

    // Filter out dogs that have already been matched
    const availableDogs = favoriteIds.filter(
      (id) => !existingMatches.includes(id)
    );

    if (availableDogs.length === 0) {
      console.log("Match API: All favorite dogs have already been matched");
      return res.status(200).json({
        message:
          "You've already matched with all of these current dogs! Try using the filters to get more unique dogs!",
        allMatched: true,
      });
    }

    // Get a random dog from the available favorites
    const randomIndex = Math.floor(Math.random() * availableDogs.length);
    const selectedDogId = availableDogs[randomIndex];
    console.log("Match API: Selected random dog ID:", selectedDogId);

    // Find the selected dog in the database
    const dog = await db.collection("dogs").findOne({ _id: selectedDogId });
    console.log("Match API: Found dog in database:", dog ? "Yes" : "No");

    if (!dog) {
      console.log("Match API: Dog not found with ID:", selectedDogId);
      return res.status(404).json({ message: "Dog not found" });
    }

    // If userId is provided, store the match in the user's matches collection
    if (userId) {
      console.log("Match API: Creating match record for user:", userId);
      const matchResult = await db.collection("matches").insertOne({
        userId,
        dogId: dog._id,
        matchedAt: new Date(),
      });
      console.log("Match API: Match record created:", matchResult.insertedId);
    } else {
      console.log(
        "Match API: No userId provided, skipping match record creation"
      );
    }

    return res.status(200).json({
      ...dog,
      remainingMatches: availableDogs.length - 1,
    });
  } catch (error) {
    console.error("Match API Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
}
