import { Router } from "express"
import passport from "passport"
import {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  handleForgotPassword,
  handleVerifyOtp,
  handleResetPassword,
} from "./auth.controller.js"
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "./auth.validation.js"
import { validate } from "../../middlewares/validation.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { authenticate } from "../../middlewares/auth.middleware.js"
import { googleCallback, facebookCallback, handleSetPassword } from "./oauth.controller.js"

const router = Router()

// Email/Password routes
router.post("/register", validate(registerSchema, "body"), asyncHandler(register))

router.post("/login", validate(loginSchema, "body"), asyncHandler(login))

router.post("/logout", asyncHandler(logout))

router.post("/refresh", asyncHandler(refreshToken))

router.post("/change-password", authenticate, validate(changePasswordSchema, "body"), asyncHandler(changePassword))

router.post("/forgot-password", validate(forgotPasswordSchema, "body"), asyncHandler(handleForgotPassword))

router.post("/verify-otp", validate(verifyOtpSchema, "body"), asyncHandler(handleVerifyOtp))

router.post("/reset-password", validate(resetPasswordSchema, "body"), asyncHandler(handleResetPassword))

// OAuth routes - Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
)

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  asyncHandler(googleCallback),
)

// OAuth routes - Facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"], session: false }),
)

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login", session: false }),
  asyncHandler(facebookCallback),
)

// Set password for OAuth users
router.post("/set-password", authenticate, asyncHandler(handleSetPassword))

export default router
