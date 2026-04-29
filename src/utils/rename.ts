import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

function replaceValue(source: string, key: string, value: string): string {
  const pattern = new RegExp(`(\\b${key}:\\s*")([^"]*?)(")`)
  return source.replace(pattern, `$1${value}$3`)
}

async function replaceFileValues(
  filePath: string,
  replacements: Array<[RegExp | string, string]>,
): Promise<void> {
  let contents = await readFile(filePath, "utf-8")
  for (const [pattern, replacement] of replacements) {
    contents = contents.replace(pattern, replacement)
  }
  await writeFile(filePath, contents)
}

export async function renameProject(
  projectDir: string,
  projectName: string,
): Promise<void> {
  // 1. Update package.json name
  const pkgPath = join(projectDir, "package.json")
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"))
  pkg.name = projectName
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n")

  // 2. Update app.config.ts — both app.name and email.fromName
  const configPath = join(projectDir, "app.config.ts")
  let config = await readFile(configPath, "utf-8")

  config = replaceValue(config, "name", projectName)
  config = replaceValue(config, "legalName", `${projectName}, Inc.`)
  config = replaceValue(config, "supportEmail", "support@example.com")
  config = replaceValue(config, "fromName", projectName)
  config = replaceValue(config, "fromAddress", "noreply@example.com")

  await writeFile(configPath, config)

  // 3. Update local service defaults that carry the template repository name
  await replaceFileValues(join(projectDir, ".env.example"), [
    [
      /^DATABASE_URL=.*$/m,
      `DATABASE_URL=postgresql://${projectName}:${projectName}@localhost:5432/${projectName}`,
    ],
    [/^MAIL_FROM=.*$/m, `MAIL_FROM=${projectName} <noreply@example.com>`],
    [/^S3_ACCESS_KEY=.*$/m, `S3_ACCESS_KEY=${projectName}`],
    [/^S3_SECRET_KEY=.*$/m, `S3_SECRET_KEY=${projectName}-secret`],
    [/^S3_BUCKET=.*$/m, `S3_BUCKET=${projectName}`],
  ])

  await replaceFileValues(join(projectDir, "docker-compose.yml"), [
    [/container_name: foundry-/g, `container_name: ${projectName}-`],
    [/POSTGRES_USER: foundry/g, `POSTGRES_USER: ${projectName}`],
    [/POSTGRES_PASSWORD: foundry/g, `POSTGRES_PASSWORD: ${projectName}`],
    [/POSTGRES_DB: foundry/g, `POSTGRES_DB: ${projectName}`],
    [/pg_isready -U foundry/g, `pg_isready -U ${projectName}`],
    [
      /postgresql:\/\/foundry:foundry@postgres:5432/g,
      `postgresql://${projectName}:${projectName}@postgres:5432`,
    ],
    [/foundry-dev-jwt-secret/g, `${projectName}-dev-jwt-secret`],
    [/MINIO_ROOT_USER: foundry/g, `MINIO_ROOT_USER: ${projectName}`],
    [
      /MINIO_ROOT_PASSWORD: foundry-secret/g,
      `MINIO_ROOT_PASSWORD: ${projectName}-secret`,
    ],
    [
      /DEFAULT_FROM_EMAIL: noreply@foundry.dev/g,
      "DEFAULT_FROM_EMAIL: noreply@example.com",
    ],
  ])

  // 4. Generate a clean README.md for the new project
  const readmePath = join(projectDir, "README.md")
  const readme = `# ${projectName}

Built with [Foundry](https://github.com/lps-ai/foundry) — an opinionated AI SaaS starter kit.

## Getting Started

\`\`\`bash
cp .env.example .env        # Edit with your settings
pnpm services:up            # Start Postgres, Redis, etc.
pnpm db:migrate && pnpm db:seed
pnpm dev                    # Start dev server
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`pnpm dev\` | Start all dev servers |
| \`pnpm build\` | Build all packages and apps |
| \`pnpm lint\` | Lint with oxlint |
| \`pnpm format\` | Format with oxfmt |
| \`pnpm typecheck\` | TypeScript type checking |
| \`pnpm test\` | Run unit tests |
| \`pnpm test:e2e\` | Run e2e tests |
`
  await writeFile(readmePath, readme)
}
