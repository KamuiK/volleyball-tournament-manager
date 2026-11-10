import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3217",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3217",
    url: "http://127.0.0.1:3217",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      AUTH_SECRET: "playwright-only-test-secret",
      AUTH_GITHUB_ID: "playwright-only-client-id",
      AUTH_GITHUB_SECRET: "playwright-only-client-secret",
      ORGANIZER_GITHUB_LOGINS: "playwright-authorized-user",
    },
  },
});
