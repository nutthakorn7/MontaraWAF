import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('/login');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should redirect to login when not authenticated', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/.*login/);
        await expect(page).toHaveURL(/.*login/);
    });

    test('should display login page correctly', async ({ page }) => {
        await page.goto('/login');

        await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'demo@test.com');
        await page.fill('input[type="password"]', 'demo1234');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('/', { timeout: 10000 });

        // Should show dashboard content
        await expect(page.getByRole('heading', { name: 'Security', exact: true })).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to register page', async ({ page }) => {
        await page.goto('/login');

        await page.click('text=Create Account');

        await expect(page).toHaveURL(/.*register/);
    });
});
