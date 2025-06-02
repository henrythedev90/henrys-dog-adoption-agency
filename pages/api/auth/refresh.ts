import { sign, verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Verify the refresh token
    const decoded = verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
    );
    const { userId } = decoded as { userId: string };

    // Check if token exists and is valid in database
    const tokenDoc = await db.collection("tokens").findOne({
      userId: new ObjectId(userId),
      refreshToken,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Get user data
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const newAccessToken = sign(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    // Generate new refresh token
    const newRefreshToken = sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );

    // Invalidate old refresh token
    await db
      .collection("tokens")
      .updateOne({ _id: tokenDoc._id }, { $set: { isValid: false } });

    // Store new refresh token
    await db.collection("tokens").insertOne({
      userId: user._id,
      refreshToken: newRefreshToken,
      isValid: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    });

    // Set new cookies
    res.setHeader("Set-Cookie", [
      `accessToken=${newAccessToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
      `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    ]);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}
