#!/usr/bin/env bash
set -euo pipefail

mkdir -p app tests/unit tests/e2e .github/workflows

cat > package.json <<'EOF'
{
  "name": "volleyball-tournament-manager",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.25.0",
    "eslint-config-next": "^15.3.0",
    "jsdom": "^26.0.0",
    "prettier": "^3.5.3",
    "typescript": "^5.8.3",
    "vitest": "^3.1.0"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
EOF

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > next.config.ts <<'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
EOF

cat > eslint.config.mjs <<'EOF'
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
];

export default eslintConfig;
EOF

cat > .prettierrc.json <<'EOF'
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
EOF

cat > .prettierignore <<'EOF'
node_modules
.next
out
coverage
playwright-report
test-results
package-lock.json
EOF

cat > vitest.config.ts <<'EOF'
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"]
  }
});
EOF

cat > playwright.config.ts <<'EOF'
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  }
});
EOF

cat > app/layout.tsx <<'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volleyball Tournament Manager",
  description:
    "Manage a mixed volleyball tournament: teams, courts, results, standings, and knockout progression."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF

cat > app/page.tsx <<'EOF'
export default function Home() {
  return (
    <main>
      <h1>Volleyball Tournament Manager</h1>
      <p>
        Manage teams, courts, results, standings, and the knockout bracket for a mixed volleyball
        tournament.
      </p>
    </main>
  );
}
EOF

cat > app/globals.css <<'EOF'
:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  line-height: 1.5;
}

main {
  padding: 1.5rem;
}
EOF

cat > tests/setup.ts <<'EOF'
import "@testing-library/jest-dom/vitest";
EOF

cat > tests/unit/home.test.tsx <<'EOF'
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("renders the application name and purpose", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Volleyball Tournament Manager" })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Manage teams, courts, results, standings/i)
  ).toBeInTheDocument();
});
EOF

cat > tests/e2e/home.spec.ts <<'EOF'
import { expect, test } from "@playwright/test";

test("home page displays the application name", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Volleyball Tournament Manager" })
  ).toBeVisible();
});
EOF

cat > AGENTS.md <<'EOF'
# Repository conventions

## Project

Volleyball Tournament Manager is a mobile-first web application for managing one current mixed volleyball tournament. The approved MVP covers teams, groups, courts, match assignments, results, standings, knockout progression, and public read-only views.

## Working rules

- Implement only explicitly approved work packages.
- Keep changes small and focused; do not perform unrelated refactoring.
- Use conventional commit messages.
- Use TypeScript strict mode.
- Keep public pages read-only and accessible without authentication.
- Enforce organizer authorization, validation, assignment conflicts, stage locks, and progression rules on the server in later work packages.
- Keep match identity independent of court, display order, and future start times.
- Design data and interfaces so historical tournaments, German localization, and an optional public timetable can be added later.
- Never commit secrets, credentials, private configuration, real tournament data, or production logs.
- The repository is public; treat all committed content as public.

## Quality gates

Before finishing a change:

1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `npm run build`.
5. Run `npm run test:e2e` when UI behavior changes.
6. Summarize changed files and manual verification steps.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run format
```

## Testing

- Use Vitest for business logic and component-level smoke tests.
- Use Playwright for user-visible E2E smoke tests.
- Add tests for scoring, ranking, qualification, locking, authorization, assignment conflicts, and reset behavior as those features are implemented.
- Do not claim WCAG conformance; maintain the practical accessibility baseline instead.

## Current scope

WP-01 establishes the repository and local foundation only. Database schema, migrations, authentication, tournament setup, scoring, standings, court assignment, knockout progression, public updating, and resets belong to later approved work packages.
EOF

cat > .env.example <<'EOF'
# Neon PostgreSQL connection string.
# Do not commit a real connection string or credentials.
DATABASE_URL=

# Auth.js secret.
# Generate locally with: openssl rand -base64 32
AUTH_SECRET=
EOF

cat > .github/workflows/ci.yml <<'EOF'
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browser
        run: npx playwright install --with-deps chromium

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Unit tests
        run: npm test

      - name: Production build
        run: npm run build

      - name: Playwright smoke test
        run: npm run test:e2e
EOF

echo "Stage 2 foundation files created."
