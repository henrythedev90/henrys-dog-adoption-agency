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
    if (req.method !== "POST" && req.method !== "DELETE") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { dogId } = req.query;
    if (!dogId || typeof dogId !== "string") {
      return res.status(400).json({ message: "Invalid dogId" });
    }

    const userId = await getSessionUserId(req, res);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db("AdoptionData");
    const usersCollection = db.collection<UserDocument>("users");

    // Get current user document
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.method === "POST") {
      // Add dogId to favorites array
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { favorites: dogId } }
      );
      console.log("Add favorite result:", result);
    } else {
      // Remove dogId from favorites array
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { favorites: dogId } }
      );
      console.log("Remove favorite result:", result);
    }

    // Get updated user document
    const updatedUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    return res.status(200).json({
      success: true,
      message:
        req.method === "POST"
          ? "Dog added to favorites"
          : "Dog removed from favorites",
      favorites: updatedUser?.favorites || [],
      dogId,
    });
  } catch (error) {
    console.error("Error in favorites API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
