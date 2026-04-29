export const TEMPLATE_REPO = "github:lps-ai/foundry"

export const FILES_TO_REMOVE = [
  // CI/automation (belongs to template repo, not user's project)
  ".github/",
  "renovate.json",
  ".gitleaks.toml",
  ".gitleaksignore",
  "lighthouserc.json",
  ".graphifyignore",

  // AI agent config (template-specific)
  "AGENTS.md",
  "apps/saas/AGENTS.md",
  "apps/saas/src/AGENTS.md",
  "packages/ui/AGENTS.md",
  "packages/ui/src/AGENTS.md",

  // OMC/Claude state (template-specific)
  ".omc/",
  ".omx/",
  ".claude/",

  // Template methodology docs (not user docs)
  "docs/",
]

export const PROJECT_NAME_REGEX = /^[a-z0-9][a-z0-9._-]*$/
