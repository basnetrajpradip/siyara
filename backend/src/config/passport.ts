import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as FacebookStrategy } from "passport-facebook"
import env from "./env.js"

export interface OAuthProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  provider: "google" | "facebook"
}

export function configurePassport() {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          scope: ["profile", "email"],
        },
        (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value
            if (!email) {
              return done(new Error("No email found from Google"), false)
            }

            const oauthProfile: OAuthProfile = {
              id: profile.id,
              email,
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              avatar: profile.photos?.[0]?.value,
              provider: "google",
            }

            return done(null, oauthProfile as any)
          } catch (error) {
            return done(error as Error, false)
          }
        },
      ),
    )
  }

  if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.FACEBOOK_APP_ID,
          clientSecret: env.FACEBOOK_APP_SECRET,
          callbackURL: env.FACEBOOK_CALLBACK_URL,
          profileFields: ["id", "emails", "name", "picture"],
        },
        (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value
            if (!email) {
              return done(new Error("No email found from Facebook"), false)
            }

            const oauthProfile: OAuthProfile = {
              id: profile.id,
              email,
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              avatar: profile.photos?.[0]?.value,
              provider: "facebook",
            }

            return done(null, oauthProfile as any)
          } catch (error) {
            return done(error as Error, false)
          }
        },
      ),
    )
  }

  passport.serializeUser((user: any, done) => {
    done(null, user)
  })

  passport.deserializeUser((user: any, done) => {
    done(null, user)
  })
}

export default passport
