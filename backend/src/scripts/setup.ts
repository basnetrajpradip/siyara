import { prisma } from "../db/prisma.js"
import { Role } from "../../prisma/generated/prisma/client.js"
import { hashPassword } from "../utils/hash.js"
import logger from "../config/logger.js"

const ADMIN_USER = {
  firstName: "Ayurdarpan",
  lastName: "Admin",
  email: "admin@ayurdarpan.com",
  password: "admin123",
}

async function main() {
  const existingUser = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN,
    },
    select: {
      id: true,
    },
  })

  if (existingUser) {
    logger.info(`Admin user already exists: ${ADMIN_USER.email}`)
    return
  }

  const password = await hashPassword(ADMIN_USER.password)

  await prisma.user.create({
    data: {
      firstName: ADMIN_USER.firstName,
      lastName: ADMIN_USER.lastName,
      email: ADMIN_USER.email,
      password,
      role: Role.ADMIN,
    },
  })

  logger.info(`Admin user created: ${ADMIN_USER.email}`)
}

main()
  .catch((error) => {
    logger.error("Failed to run setup script:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
