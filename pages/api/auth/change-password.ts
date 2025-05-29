import { NextApiRequest, NextApiResponse } from "next";
import { compare, hash } from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Current password and new password are required",
    });
  }

  // Password validation
  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "New password must be at least 8 characters long",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Get the authenticated user from the request
    const userId = (req as any).user.userId;

    // Find the user by ID
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId as string),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);

    // Update the user's password and updatedAt timestamp
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId as string) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    // Invalidate all existing refresh tokens for this user
    await db.collection("tokens").updateMany(
      {
        userId: new ObjectId(userId as string),
        isValid: true,
      },
      {
        $set: {
          isValid: false,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      error: "Failed to change password",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
