import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { getSessionUserId } from "@/utils/auth";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { dogId } = req.body;
      if (!dogId) {
        return res.status(400).json({ message: "The Dogs ID is required" });
      }

      const userId = await getSessionUserId(req, res);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const client = await clientPromise;
      const db = client.db("AdoptionData");

      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $addToSet: { favorites: dogId } }
        );

      return res.status(200).json({ message: "Dog added to favorites" });
    }
    if (req.method === "GET") {
      const userId = await getSessionUserId(req, res);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const client = await clientPromise;
      const db = client.db("AdoptionData");
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });

      return res.status(200).json({ favorites: user?.favorites || [] });
    }
  } catch (error) {
    console.error("Error in favorites API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
