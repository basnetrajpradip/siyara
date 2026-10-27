// Run by .husky/pre-commit. Checks only the packages that have staged changes,
// so a backend-only commit doesn't wait on the frontend build (and vice versa).
import { execSync } from "node:child_process"
import pc from "picocolors"

const CHECKS = {
  frontend: ["pnpm typecheck", "pnpm lint", "pnpm build"],
}

const staged = execSync("git diff --cached --name-only --diff-filter=ACMR", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)

const packages = Object.keys(CHECKS).filter((dir) => staged.some((file) => file.startsWith(`${dir}/`)))

if (packages.length === 0) {
  console.log(pc.dim("pre-commit: no checked packages staged, skipping"))
  process.exit(0)
}

for (const dir of packages) {
  for (const command of CHECKS[dir]) {
    console.log(pc.cyan(`\n▶ ${dir}: ${command}`))
    try {
      execSync(command, { cwd: dir, stdio: "inherit" })
    } catch {
      console.error(pc.red(`\n✖ ${dir}: "${command}" failed. Fix it, or commit with --no-verify to skip.`))
      process.exit(1)
    }
  }
}

console.log(pc.green("\n✔ pre-commit checks passed"))
