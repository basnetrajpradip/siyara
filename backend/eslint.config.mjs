import { defineConfig, globalIgnores } from "eslint/config"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import nodePlugin from "eslint-plugin-n"
import securityPlugin from "eslint-plugin-security"
import unusedImports from "eslint-plugin-unused-imports"
import prettier from "eslint-config-prettier"

export default defineConfig([
  // Ignore build & runtime files
  globalIgnores(["node_modules/**", "dist/**", "build/**", "logs/**"]),

  // TypeScript backend rules
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
      n: nodePlugin,
      security: securityPlugin,
      "unused-imports": unusedImports,
    },

    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      "n/no-process-exit": "off",

      "security/detect-eval-with-expression": "error",

      "no-console": "off",
    },
  },

  prettier,
])
