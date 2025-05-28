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
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const accessToken = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "No tokens provided" });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // First try to verify access token
    if (accessToken) {
      try {
        const decoded = verify(
          accessToken,
          process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: string };

        const user = await db.collection("users").findOne({
          _id: new ObjectId(decoded.userId),
        });

        if (user) {
          return res.status(200).json({
            user: {
              _id: user._id,
              userName: user.userName,
              email: user.email,
            },
          });
        }
      } catch (error) {
        // Access token is invalid, continue to refresh token check
        console.log("Access token invalid, trying refresh token");
      }
    }

    // If access token is invalid or missing, try refresh token
    if (refreshToken) {
      try {
        const decoded = verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
        ) as { userId: string };

        // Check if refresh token exists and is valid in database
        const tokenDoc = await db.collection("tokens").findOne({
          refreshToken,
          userId: new ObjectId(decoded.userId),
          isValid: true,
          expiresAt: { $gt: new Date() },
        });

        if (!tokenDoc) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const user = await db.collection("users").findOne({
          _id: new ObjectId(decoded.userId),
        });

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        return res.status(200).json({
          user: {
            _id: user._id,
            userName: user.userName,
            email: user.email,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    }

    // If we get here, no valid tokens were found
    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
