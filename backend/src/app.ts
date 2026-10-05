import express from "express"
import cors from "cors"
import compression from "compression"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import session from "express-session"
import passport from "passport"
import path from "node:path"

import { loadRoutes } from "./routes/routeLoader.js"
import { errorHandler } from "./middlewares/error.middleware.js"
import { sendSuccessResponse } from "./utils/response.js"
import env from "./config/env.js"
import { NotFoundError } from "./errors/app.error.js"
import { configurePassport } from "./config/passport.js"

const app = express()

app.set("trust proxy", 1) // Trust first proxy for rate limiting and secure cookies

// Core middlewares
app.use(express.json({ limit: "10kb" }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_URL],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Client-Type"],
  }),
)

// Session middleware (required for OAuth flow)
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
)

// Configure Passport
configurePassport()
app.use(passport.initialize())

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
app.use(compression())

// Static file serving for uploaded media
app.use(`/${env.MEDIA_DIR}`, express.static(path.resolve(env.MEDIA_DIR)))

//Health check
app.get("/health", (_req, res) => {
  sendSuccessResponse(res, { uptime: process.uptime() }, "Server is healthy")
})

// Load routes dynamically
await loadRoutes(app)

// 404 handler
app.use((_req, _res) => {
  throw new NotFoundError("Resource Not Found")
})

// Global error handler
app.use(errorHandler)

export default app
