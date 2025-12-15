import { test, expect } from "@playwright/test";

test("login screen shows Google sign-in link", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // Works with both "Continue with Google" or "Sign in with Google"
  await expect(
    page.getByRole("link", { name: /google/i })
  ).toBeVisible();

  // Optional: check title text exists
  await expect(
    page.getByText(/capstone finance/i)
  ).toBeVisible();
});
