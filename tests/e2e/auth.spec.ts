import { expect, test } from "@playwright/test";

test("public home remains available without authentication", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Volleyball Tournament Manager" }),
  ).toBeVisible();
});

test("missing auth configuration rejects organizer access", async ({ page }) => {
  await page.goto("/organizer");

  await expect(page).toHaveURL(/\/login\?error=SignInUnavailable/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("configured but anonymous organizer access is sent to login", async ({ page }) => {
  await page.goto("/organizer");

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Forganizer/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("login controls are keyboard accessible and show safe feedback", async ({ page }) => {
  await page.goto("/login?error=AccessDenied");

  const button = page.getByRole("button", { name: "Continue with GitHub" });
  await expect(button).toBeVisible();
  await expect(
    page.getByText("This GitHub account is not authorized for organizer access.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
});
