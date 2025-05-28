import { NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const isTest = process.env.NODE_ENV === "test";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    if (!isTest) console.log("Auth check: Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Extract token from cookies
    const token = cookies
      .split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      return res.status(401).json({ error: "No token found" });
    }

    // Verify token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { id: string };

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Get user data
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id),
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}
