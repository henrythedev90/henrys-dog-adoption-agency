import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that should be protected
const protectedPaths = ["/dogs", "/dogs/favorites"];
// Add paths that should only be accessible when NOT authenticated
const authPaths = ["/"];

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (currentUser && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/dogs", request.url));
  }

  // Redirect unauthenticated users to login
  if (
    !currentUser &&
    protectedPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedPaths, ...authPaths],
};
