import { expect, test } from "@playwright/test";

test("home page displays the application name", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Volleyball Tournament Manager" })
  ).toBeVisible();
});
