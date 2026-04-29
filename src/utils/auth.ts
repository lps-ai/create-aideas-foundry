import { execSync } from "node:child_process"

export function getGitHubToken(): string {
  // 1. Explicit env var (CI, power users)
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN

  // 2. gh CLI fallback (local dev)
  try {
    return execSync("gh auth token", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim()
  } catch {
    throw new Error(
      "GitHub authentication required.\n" +
        "Foundry needs access to the private template repository.\n\n" +
        "Option 1: Run 'gh auth login' (recommended)\n" +
        "Option 2: Set GITHUB_TOKEN environment variable",
    )
  }
}
