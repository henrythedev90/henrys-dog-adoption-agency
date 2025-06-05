import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserId } from "@/utils/auth";
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "AdoptionData";
const USERS_COLLECTION = "users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const userId = await getSessionUserId(req, res);
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          preferences: req.body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: req.body,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({
      error: "Failed to update preferences",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await client.close();
  }
}
