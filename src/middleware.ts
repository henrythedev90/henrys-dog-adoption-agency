import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify, sign } from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Add paths that should be protected
const protectedPaths = ["/dogs", "/dogs/favorites", "/dashboard", "/profile"];
// Add paths that should only be accessible when NOT authenticated
const authPaths = ["/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Handle auth paths (login, register, etc.)
  if (authPaths.includes(pathname)) {
    if (accessToken) {
      try {
        // Verify access token
        verify(accessToken, process.env.JWT_SECRET || "your-secret-key");
        // If valid, redirect to dashboard
        return NextResponse.redirect(new URL("/dogs", request.url));
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
        // If access token is invalid, continue to auth page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // If there's no access token, try to use refresh token
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.redirect(new URL("/", request.url));
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
          return NextResponse.redirect(new URL("/", request.url));
        }

        // Get user data
        const user = await db.collection("users").findOne({
          _id: new ObjectId(decoded.userId),
        });

        if (!user) {
          return NextResponse.redirect(new URL("/", request.url));
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
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3600, // 1 hour
        });

        return response;
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    try {
      // Verify access token
      verify(accessToken, process.env.JWT_SECRET || "your-secret-key");
      return NextResponse.next();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      // If access token is invalid, try to use refresh token
      if (refreshToken) {
        return middleware(request); // Recursively try refresh token flow
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
