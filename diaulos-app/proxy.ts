import { type NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

/**
 * Middleware function that checks for an active authentication session before allowing access to protected routes.
 * If no session is found and the requested URL is not in the list of open URLs, the user is redirected to the home page.
 * Otherwise, the request is allowed to proceed.
 */
export async function proxy(request: NextRequest) {
  try {
    const session = await getCookieCache(request);

    // Define URLs that can be accessed without authentication
    const openUrls = ["/"];

    // If there's no session and the requested URL is in the list of open URLs, allow access
    if (!session && openUrls.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // If there's no session and the requested URL is not in the list of open URLs, redirect to home page
    if (!session && !openUrls.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if the user has the admin role for admin dashboard routes
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      session &&
      (session.user as any).role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (_error) {
    // Delete the session cookie if there's an error (e.g., invalid session)
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("better-auth.session_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)"],
};
