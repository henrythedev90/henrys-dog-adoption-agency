import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
        headers: {
          "Content-Type": "application/json",
        },
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
      // Create a new request to the refresh endpoint
      const refreshResponse = await fetch(
        new URL("/api/auth/refresh", request.url),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refreshToken=${refreshToken}`,
          },
          credentials: "include",
        }
      );

      if (refreshResponse.ok) {
        // Get the new cookies from the refresh response
        const cookies = refreshResponse.headers.getSetCookie();

        // Create a response that will continue to the requested page
        const response = NextResponse.next();

        // Add the new cookies to the response
        cookies.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });

        return response;
      } else {
        // If refresh failed, clear cookies and redirect
        const response = pathname.startsWith("/api/")
          ? new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
              status: 401,
              headers: {
                "Content-Type": "application/json",
              },
            })
          : NextResponse.redirect(new URL("/", request.url));

        // Clear the cookies
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");

        return response;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);

      // On error, clear cookies and redirect
      const response = pathname.startsWith("/api/")
        ? new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          })
        : NextResponse.redirect(new URL("/", request.url));

      // Clear the cookies
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      return response;
    }
  }

  // If we get here, something went wrong
  if (pathname.startsWith("/api/")) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
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
