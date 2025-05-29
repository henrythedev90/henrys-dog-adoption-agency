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
    const { dogId } = req.query;
    if (req.method !== "DELETE") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!dogId || typeof dogId !== "string") {
      return res.status(400).json({ message: "Invalid dogId" });
    }

    const userId = await getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db("AdoptionData");

    await db
      .collection<UserDocument>("users")
      .updateOne(
        { _id: new ObjectId(userId as string) },
        { $pull: { favorites: dogId } }
      );

    return res
      .status(200)
      .json({ success: true, message: "Dog removed from favorites" });
  } catch (error) {
    console.error("Error in favorites API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
