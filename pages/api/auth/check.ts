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
    // Debug: Log incoming cookies
    console.log("/api/auth/check: Incoming cookies:", req.cookies);
    const accessToken = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];
    console.log("/api/auth/check: accessToken present?", !!accessToken);
    console.log("/api/auth/check: refreshToken present?", !!refreshToken);

    if (!accessToken && !refreshToken) {
      console.log("/api/auth/check: No tokens provided");
      return res.status(401).json({ message: "No tokens provided" });
    }

    // Defensive: Check for malformed accessToken
    if (accessToken && accessToken.split(".").length !== 3) {
      console.log(
        "/api/auth/check: Malformed accessToken detected, clearing cookies."
      );
      res.setHeader("Set-Cookie", [
        `accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
        `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
      ]);
      return res.status(401).json({ message: "Malformed access token" });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // First try to verify access token
    if (accessToken) {
      try {
        console.log("/api/auth/check: Trying accessToken");
        const decoded = verify(
          accessToken,
          process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: string };

        const user = await db.collection("users").findOne({
          _id: new ObjectId(decoded.userId),
        });

        if (user) {
          console.log("/api/auth/check: Access token valid, user found");
          res.setHeader("Set-Cookie", [
            `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
            `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
          ]);
          return res.status(200).json({
            user: {
              _id: user._id,
              userName: user.userName,
              email: user.email,
            },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(
            "/api/auth/check: Access token invalid, trying refresh token",
            error.message
          );
        } else {
          console.log(
            "/api/auth/check: Access token invalid, trying refresh token",
            error
          );
        }
      }
    }

    // If access token is invalid or missing, try refresh token
    if (refreshToken) {
      try {
        console.log("/api/auth/check: Trying refreshToken");
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
          console.log(
            "/api/auth/check: Invalid refresh token (not found in DB)"
          );
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const user = await db.collection("users").findOne({
          _id: new ObjectId(decoded.userId),
        });

        if (!user) {
          console.log("/api/auth/check: User not found for refresh token");
          return res.status(401).json({ message: "User not found" });
        }

        console.log("/api/auth/check: Refresh token valid, user found");
        res.setHeader("Set-Cookie", [
          `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
          `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
        ]);
        return res.status(200).json({
          user: {
            _id: user._id,
            userName: user.userName,
            email: user.email,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("/api/auth/check: Refresh token error:", error.message);
        } else {
          console.error("/api/auth/check: Refresh token error:", error);
        }
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    }

    // If we get here, no valid tokens were found
    console.log("/api/auth/check: No valid tokens found after checks");
    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
