import fs from "fs"
import path from "path"
import express from "express"
import { fileURLToPath, pathToFileURL } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const loadRoutes = async (app: express.Express) => {
  const modulesPath = path.join(__dirname, "../modules")

  if (!fs.existsSync(modulesPath)) {
    throw new Error("Modules directory not found")
  }

  const modules = fs.readdirSync(modulesPath)

  for (const moduleName of modules) {
    const modulePath = path.join(modulesPath, moduleName)

    if (!fs.lstatSync(modulePath).isDirectory()) continue

    const files = fs.readdirSync(modulePath)

    for (const file of files) {
      if (!file.endsWith(".routes.ts") && !file.endsWith(".routes.js")) continue

      const routeName = file.replace(".routes.ts", "").replace(".routes.js", "")

      const fullPath = path.join(modulePath, file)

      const routeModule = await import(pathToFileURL(fullPath).href)
      const router = routeModule.default

      if (!router) continue

      const routeSuffix = routeName === moduleName ? "" : `/${routeName}`
      const basePath = `/api/${moduleName}${routeSuffix}`

      app.use(basePath, router)
    }
  }
}
