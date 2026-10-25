import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Actions replaces this with the repository path during deployment.
  base: process.env.GITHUB_ACTIONS === "true" && process.env.APK_BUILD !== "1" ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? ""}/` : "./",
  build: { target: "es2022", sourcemap: true },
  test: { environment: "node" }
});