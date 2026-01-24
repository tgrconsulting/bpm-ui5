// proxy.ts
import { auth } from "@/auth"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // 1. If not logged in, redirect to sign-in with a callbackUrl
  if (!isLoggedIn && nextUrl.pathname !== "/login") {
    // Clone the current URL to preserve the original destination
    const callbackUrl = nextUrl.href;

    // Construct the redirect URL with the callbackUrl parameter
    const signInUrl = new URL("/login", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", callbackUrl);

    return Response.redirect(signInUrl);
  }

  // 2. Optional: If ALREADY logged in and trying to access sign-in, 
  // redirect them to your main dashboard/home page
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return Response.redirect(new URL("/dashboard", nextUrl.origin));
  }
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|images|favicon.ico|login).*)"],
}
