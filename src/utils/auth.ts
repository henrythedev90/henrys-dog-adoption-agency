import { verify, sign } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function getSessionUserId(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accessToken = req.cookies["accessToken"];
  const refreshToken = req.cookies["refreshToken"];
  const client = await clientPromise;
  const db = client.db("AdoptionData");

  if (accessToken) {
    try {
      const decoded = verify(
        accessToken,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: string };
      console.log("This is the access token:", accessToken);
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        return decoded.userId;
      }
    } catch (error) {
      console.error("Access token verification failed:", error);
      // Do NOT return here! Try refreshToken next.
    }
  }

  if (refreshToken) {
    try {
      const decoded = verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
      ) as { userId: string };
      const tokenDoc = await db
        .collection("tokens")
        .findOne({ userId: decoded.userId, refreshToken: refreshToken });
      if (tokenDoc) {
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(tokenDoc.userId as string) });
        if (user) {
          // --- Issue new access token ---
          const newAccessToken = sign(
            {
              userId: user._id,
              email: user.email,
              userName: user.userName,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
          );

          // Optionally, issue a new refresh token as well
          // const newRefreshToken = sign(...);

          res.setHeader("Set-Cookie", [
            `accessToken=${newAccessToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
            // Optionally, set new refresh token here
            // `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
          ]);

          return res.status(200).json({
            user: {
              _id: user._id,
              userName: user.userName,
              email: user.email,
            },
          });
        }
      }
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  return null; // Only return null if both fail
}
