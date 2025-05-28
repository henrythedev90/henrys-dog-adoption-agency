import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("Signup API: Invalid method:", req.method);
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      userName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId };

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    // Set the token in an HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900`
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
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
