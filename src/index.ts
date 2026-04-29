import { defineCommand, runMain } from "citty"
import { spawnSync } from "node:child_process"
import { resolve } from "node:path"
import consola from "consola"
import {
  validateProjectName,
  checkDirectoryAvailable,
  checkPnpmAvailable,
  checkGitAvailable,
} from "./utils/preflight.js"
import { downloadTemplate } from "./utils/template.js"
import { cleanupTemplateFiles } from "./utils/cleanup.js"
import { renameProject } from "./utils/rename.js"

const main = defineCommand({
  meta: {
    name: "create-foundry",
    version: "0.1.0",
    description: "Create a new Foundry AI SaaS project",
  },
  args: {
    name: {
      type: "positional",
      description: "Project name (e.g., my-app)",
      required: true,
    },
  },
  async run({ args }) {
    const projectName = args.name as string
    const targetDir = resolve(process.cwd(), projectName)

    // Pre-flight checks
    try {
      validateProjectName(projectName)
      checkDirectoryAvailable(targetDir, projectName)
      checkPnpmAvailable()
      checkGitAvailable()
    } catch (error) {
      consola.error((error as Error).message)
      process.exit(1)
    }

    consola.box("Foundry — AI SaaS Starter Kit")

    // 1. Download template
    consola.start("Downloading Foundry template...")
    try {
      await downloadTemplate(targetDir)
      consola.success("Template downloaded")
    } catch (error) {
      consola.error("Failed to download template:", (error as Error).message)
      process.exit(1)
    }

    // 2. Clean up repo-specific files
    consola.start("Cleaning up template files...")
    await cleanupTemplateFiles(targetDir)
    consola.success("Cleaned up")

    // 3. Rename project
    consola.start("Configuring project...")
    await renameProject(targetDir, projectName)
    consola.success("Project configured")

    // 4. Install dependencies (streamed output)
    consola.start("Installing dependencies...")
    const installResult = spawnSync("pnpm", ["install"], {
      cwd: targetDir,
      stdio: "inherit",
    })
    if (installResult.status !== 0) {
      consola.warn("Dependency install failed. Run 'pnpm install' manually.")
    } else {
      consola.success("Dependencies installed")
    }

    // 5. Initialize git (check status codes — spawnSync doesn't throw on failure)
    const gitInit = spawnSync("git", ["init"], {
      cwd: targetDir,
      stdio: "pipe",
    })
    if (gitInit.status === 0) {
      spawnSync("git", ["add", "-A"], { cwd: targetDir, stdio: "pipe" })
      const gitCommit = spawnSync(
        "git",
        ["commit", "-m", "Initial commit from Foundry"],
        { cwd: targetDir, stdio: "pipe" },
      )
      if (gitCommit.status === 0) {
        consola.success("Git repository initialized")
      } else {
        consola.warn(
          "Git init succeeded but commit failed.\n" +
            "You may need to configure: git config --global user.name && git config --global user.email",
        )
      }
    } else {
      consola.warn("Could not initialize git repository.")
    }

    // 6. Print next steps
    console.log("")
    consola.box(
      `Done! Your Foundry project "${projectName}" is ready.\n\n` +
        `Next steps:\n` +
        `  cd ${projectName}\n` +
        `  cp .env.example .env        # Edit with your settings\n` +
        `  pnpm services:up            # Start Postgres, Redis, etc.\n` +
        `  pnpm db:migrate && pnpm db:seed\n` +
        `  pnpm dev                    # Start dev server`,
    )
  },
})

runMain(main)
