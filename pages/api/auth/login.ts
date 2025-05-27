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
    console.log("Login API: Invalid method:", req.method);
    return res.status(405).json({ error: "Method is not allowed" });
  }

  const { userName, email, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!userName && !email) {
    return res.status(400).json({ message: "Username or email is required" });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Find user by username or email
    const user = await db.collection("users").findOne({
      $or: [{ userName: userName || "" }, { email: email || "" }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    // Set the token in an HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900`
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login API: Login failed:", error);
    return res.status(500).json({
      error: "Failed to login",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
