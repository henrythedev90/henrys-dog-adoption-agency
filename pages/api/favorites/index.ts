import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { getSessionUserId } from "@/utils/auth";
import { ObjectId } from "mongodb";

interface UserDocument {
  _id: ObjectId;
  favorites: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const userId = await getSessionUserId(req, res);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db("AdoptionData");
    const usersCollection = db.collection<UserDocument>("users");

    // Get user document
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      favorites: user.favorites || [],
    });
  } catch (error) {
    console.error("Error in favorites API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
