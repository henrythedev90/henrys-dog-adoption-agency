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

  // Skip middleware for auth-related endpoints
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // If no tokens exist, redirect to login
  if (!accessToken && !refreshToken) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If access token exists, proceed
  if (accessToken) {
    return NextResponse.next();
  }

  // If only refresh token exists, try to refresh
  if (refreshToken) {
    try {
      const response = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Create response with new tokens
        const res = NextResponse.next();

        // Copy cookies from refresh response
        const cookies = response.headers.getSetCookie();
        cookies.forEach((cookie) => {
          res.headers.append("Set-Cookie", cookie);
        });

        return res;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  }

  // If refresh failed, redirect to login
  if (pathname.startsWith("/api/")) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  return NextResponse.redirect(new URL("/", request.url));
}

// Configure which routes to protect
export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/favorites/:path*",
  ],
};
