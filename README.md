# create-foundry

Create new Foundry AI SaaS projects from the command line.

## Usage

```bash
npx create-foundry my-app
# or
npm create foundry my-app
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** (install: `npm install -g pnpm`)
- **GitHub CLI** authenticated (`gh auth login`) — or set `GITHUB_TOKEN` env var

## What it does

1. Downloads the Foundry monorepo template from GitHub
2. Renames the project to your chosen name
3. Removes template-specific files (CI config, docs, etc.)
4. Installs dependencies via pnpm
5. Initializes a fresh git repository
6. Prints next steps to get you started

## Authentication

The Foundry template is a private repository. The CLI detects your GitHub token automatically:

1. **`GITHUB_TOKEN`** or **`GH_TOKEN`** environment variable (for CI)
2. **`gh auth token`** from the GitHub CLI (for local dev)

## After creation

```bash
cd my-app
cp .env.example .env        # Edit with your settings
pnpm services:up            # Start Postgres, Redis, etc.
pnpm db:migrate && pnpm db:seed
pnpm dev                    # Start dev server
```

## License

Private
