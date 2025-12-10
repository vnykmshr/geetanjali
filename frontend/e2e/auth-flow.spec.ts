import { test, expect } from "@playwright/test";

/**
 * E2E tests for authentication flow.
 * Tests signup, login, and logout functionality.
 */
test.describe("Authentication Flow", () => {
  test("signup page loads and validates input", async ({ page }) => {
    await page.goto("/signup");

    // Verify signup page loads - h2 says "Create Your Account"
    await expect(page.locator("h2")).toContainText("Create Your Account", { timeout: 15000 });

    // Verify form fields exist
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

    // Verify the submit button exists
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("signup validates password requirements", async ({ page }) => {
    await page.goto("/signup");

    // Wait for page to load
    await expect(page.locator("h2")).toContainText("Create Your Account", { timeout: 15000 });

    // Fill all required fields
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");

    // Fill weak password
    await page.fill('input[name="password"]', "weak");
    await page.fill('input[name="confirmPassword"]', "weak");

    // Submit
    await page.click('button[type="submit"]');

    // Should show password requirement error - target the red error text specifically
    await expect(page.locator(".text-red-600")).toContainText("at least 8 characters", { timeout: 5000 });
  });

  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");

    // Verify login page loads - h2 says "Welcome Back"
    await expect(page.locator("h2")).toContainText("Welcome Back", { timeout: 15000 });

    // Verify form fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Verify signup link exists in the form area (use the one with lowercase "up")
    await expect(page.getByRole("link", { name: "Sign up", exact: true })).toBeVisible();
  });

  test("can navigate between login and signup", async ({ page }) => {
    // Start at login
    await page.goto("/login");
    await expect(page.locator("h2")).toContainText("Welcome Back", { timeout: 15000 });

    // Click signup link in the form (the one that says "Sign up" with lowercase u)
    await page.getByRole("link", { name: "Sign up", exact: true }).click();
    await expect(page).toHaveURL("/signup");
    await expect(page.locator("h2")).toContainText("Create Your Account", { timeout: 15000 });

    // Click login link from signup page (the one that says "Sign in")
    await page.getByRole("link", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/login");
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");

    // Verify page loads - should have some heading about password reset
    await expect(
      page.locator("h2").or(page.locator("h1"))
    ).toBeVisible({ timeout: 15000 });

    // Should have email input
    await expect(page.locator('input[name="email"]').or(page.locator('input[type="email"]'))).toBeVisible();
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Wait for page load
    await expect(page.locator("h2")).toContainText("Welcome Back", { timeout: 15000 });

    // Fill invalid credentials
    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "wrongpassword123");

    // Submit
    await page.click('button[type="submit"]');

    // Should show error message - look for the red error text
    await expect(page.locator(".text-red-600")).toBeVisible({ timeout: 15000 });
  });
});
