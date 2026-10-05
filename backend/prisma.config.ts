import "dotenv/config"
import { defineConfig } from "prisma/config"

function buildDatabaseUrl(): string | undefined {
  const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } = process.env

  if (!DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_NAME) {
    return undefined
  }

  const host = process.env.DATABASE_HOST ?? "localhost"
  const port = process.env.DATABASE_PORT ?? "5432"

  return `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${host}:${port}/${DATABASE_NAME}`
}

export default defineConfig({
  schema: "prisma/schema/",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: buildDatabaseUrl(),
  },
})
