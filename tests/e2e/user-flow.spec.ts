import { test, expect } from "@playwright/test";

test.describe("Gamic Platform", () => {
  test("homepage loads and shows title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Gamic/);
  });

  test("navigate to categories", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Categorías").click();
    await expect(page).toHaveURL(/\/categories/);
  });

  test("categories page shows all 5 games", async ({ page }) => {
    await page.goto("/categories");
    await expect(page.getByText("Hex Merge")).toBeVisible();
    await expect(page.getByText("Quick Math")).toBeVisible();
    await expect(page.getByText("Asteroid Sweep")).toBeVisible();
    await expect(page.getByText("Pivot")).toBeVisible();
    await expect(page.getByText("Flip Tactics")).toBeVisible();
  });

  test("game page loads with canvas", async ({ page }) => {
    await page.goto("/play/hex-merge");
    await expect(page.locator("iframe")).toBeAttached();
    await expect(page.getByText("Iniciar")).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByText("Iniciar sesión")).toBeVisible();
  });

  test("user registration flow", async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Test123456!");
    await page.getByRole("button", { name: /registrarse/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("profile redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("ranking page loads", async ({ page }) => {
    await page.goto("/ranking");
    await expect(page.getByText("Ranking")).toBeVisible();
    await expect(page.getByText("Todos")).toBeVisible();
  });

  test("ranking filters by game", async ({ page }) => {
    await page.goto("/ranking?game=hex-merge");
    await expect(page.getByText("Hex Merge")).toBeVisible();
  });
});
