import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isProtectedRoute, isGuestOnlyRoute } from "@/configs/routes"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const refreshToken = request.cookies.get("frontend_refreshToken")?.value
  const isAuthenticated = !!refreshToken

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("returnTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isGuestOnlyRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ],
}
