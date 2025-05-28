import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verify } from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get both tokens from cookies
    const accessToken = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];

    if (refreshToken) {
      try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("AdoptionData");

        // Verify the refresh token to get userId
        const decoded = verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
        ) as { userId: string };

        if (decoded?.userId) {
          // Delete all refresh tokens for this user
          await db.collection("tokens").deleteMany({
            userId: new ObjectId(decoded.userId),
          });

          console.log(`Deleted all tokens for user: ${decoded.userId}`);
        } else {
          // If we can't verify the token, just delete the specific refresh token
          await db.collection("tokens").deleteOne({ refreshToken });
        }
      } catch (dbError) {
        console.error("Error deleting tokens:", dbError);
        // Continue with logout even if token deletion fails
      }
    }

    // Clear all auth cookies with secure settings
    const cookieOptions = {
      Path: "/",
      Expires: new Date(0),
      HttpOnly: true,
      SameSite: "Lax" as const,
      ...(process.env.NODE_ENV === "production" && { Secure: true }),
    };

    res.setHeader("Set-Cookie", [
      `accessToken=; ${Object.entries(cookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
      `refreshToken=; ${Object.entries(cookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
    ]);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Even if there's an error, clear the cookies
    const cookieOptions = {
      Path: "/",
      Expires: new Date(0),
      HttpOnly: true,
      SameSite: "Lax" as const,
      ...(process.env.NODE_ENV === "production" && { Secure: true }),
    };

    res.setHeader("Set-Cookie", [
      `accessToken=; ${Object.entries(cookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
      `refreshToken=; ${Object.entries(cookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
    ]);

    return res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
