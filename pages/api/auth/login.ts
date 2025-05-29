import { NextApiRequest, NextApiResponse } from "next";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { emailOrUserName, password } = req.body;

    if (!emailOrUserName || !password) {
      console.log("Missing required fields:", { emailOrUserName, password });
      return res
        .status(400)
        .json({ message: "Email/Username and password are required" });
    }

    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Try to find user by email or userName
    const user = await db.collection("users").findOne({
      $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
    });

    if (!user) {
      console.log("User not found for:", emailOrUserName);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", emailOrUserName);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate access token
    const accessToken = sign(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    // Generate refresh token
    const refreshToken = sign(
      {
        userId: user._id,
      },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );

    // Store refresh token in database
    await db.collection("tokens").insertOne({
      userId: user._id,
      refreshToken,
      isValid: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    });

    // Set cookies
    res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${
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
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
