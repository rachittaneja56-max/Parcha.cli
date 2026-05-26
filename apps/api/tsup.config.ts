import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["cjs"],
  platform: "node",
  target: "node18",
  noExternal: ["@repo"], // transpile packages starting with `@repo` and their dependencies
  external: [
    "winston",
    "express",
    "cors",
    "helmet",
    "express-rate-limit",
    "@trpc/server",
    "zod",
    "@scalar/express-api-reference",
    "trpc-to-openapi",
    "dotenv",
    "bcrypt"
  ],
  splitting: false,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
  shims: true,
});
