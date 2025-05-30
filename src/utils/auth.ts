import { verify } from "jsonwebtoken";
import { NextApiRequest } from "next";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function getSessionUserId(req: NextApiRequest) {
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
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        return decoded.userId;
      }
    } catch (error) {
      console.error("Access token verification failed:", error);
      return null;
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
        .findOne({ userId: decoded.userId, token: refreshToken });
      if (tokenDoc) {
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(tokenDoc.userId as string) });
        if (user) {
          return user._id.toString();
        }
      }
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }
}
