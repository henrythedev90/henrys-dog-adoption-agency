import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { ObjectId } from "mongodb";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }

  const { userName, email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message: "Please enter a valid email",
    });
  }

  if (!userName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const hashedPassword = await hash(password, 12);
    const newUser = {
      userName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId };

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
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );

    // Store refresh token in database
    await db.collection("tokens").insertOne({
      userId: new ObjectId(user._id),
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

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token: accessToken,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup API: Registration failed:", error);
    return res.status(500).json({
      error: "Failed to create user",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
