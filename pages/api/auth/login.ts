import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res
      .status(400)
      .json({ message: "Email/Username and password are required." });
  }

  const client = await clientPromise;
  const db = client.db("AdoptionData");

  try {
    console.log("Attempting to find user with:", emailOrUsername);

    // Find user by either email or username
    const user = await db.collection("users").findOne({
      $or: [{ email: emailOrUsername }, { userName: emailOrUsername }],
    });

    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("No user found with:", emailOrUsername);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log("Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", emailOrUsername);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.userName,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Set the token as an HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400` // 1 day
    );

    console.log("Login successful for user:", user.userName);
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
      },
      token,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
