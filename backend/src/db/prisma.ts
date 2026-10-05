import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../prisma/generated/prisma/client.js"
import env from "../config/env.js"

declare global {
  var prisma: PrismaClient | undefined
}

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  })

export const prisma = globalThis.prisma ?? createPrismaClient()

if (env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
