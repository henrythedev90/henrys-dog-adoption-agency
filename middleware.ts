import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify, sign } from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function middleware(request: NextRequest) {
  // Get the tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // If there's no access token, try to use refresh token
  if (!accessToken) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      // Verify refresh token
      const decoded = verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
      ) as { userId: string };

      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db("AdoptionData");

      // Check if refresh token exists and is valid
      const tokenDoc = await db.collection("tokens").findOne({
        refreshToken,
        userId: new ObjectId(decoded.userId),
        isValid: true,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }

      // Get user data
      const user = await db.collection("users").findOne({
        _id: new ObjectId(decoded.userId),
      });

      if (!user) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }

      // Create new access token
      const newAccessToken = sign(
        {
          userId: user._id,
          email: user.email,
          userName: user.userName,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      // Create response with new access token
      const response = NextResponse.next();
      response.cookies.set({
        name: "accessToken",
        value: newAccessToken,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3600, // 1 hour
      });

      return response;
    } catch (error) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  try {
    // Verify access token
    verify(accessToken, process.env.JWT_SECRET || "your-secret-key");
    return NextResponse.next();
  } catch (error) {
    // If access token is invalid, try to use refresh token
    if (refreshToken) {
      return middleware(request); // Recursively try refresh token flow
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

// Configure which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    // Add other protected routes here
  ],
};
