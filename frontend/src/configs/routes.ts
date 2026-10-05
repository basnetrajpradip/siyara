export const protectedRoutes = ["/dashboard", "/profile", "/orders", "/cart", "/checkout"]
export const guestOnlyRoutes = ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"]

export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

export function isGuestOnlyRoute(pathname: string) {
  return guestOnlyRoutes.some((route) => pathname.startsWith(route))
}
