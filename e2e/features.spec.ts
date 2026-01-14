import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.evaluate(() => {
            localStorage.setItem('access_token', 'mock-token');
            localStorage.setItem('mock_user', JSON.stringify({
                id: 'test-user',
                email: 'test@test.com',
                name: 'Test User',
                role: 'admin',
                created_at: new Date().toISOString()
            }));
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should have theme toggle button', async ({ page }) => {
        // Check that theme toggle exists (looking for sun or moon icon button)
        const themeButton = page.locator('button').filter({
            has: page.locator('svg.lucide-sun, svg.lucide-moon')
        }).first();

        await expect(themeButton).toBeVisible();
    });
});

test.describe('UI Components', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.evaluate(() => {
            localStorage.setItem('access_token', 'mock-token');
            localStorage.setItem('mock_user', JSON.stringify({
                id: 'test-user',
                email: 'test@test.com',
                name: 'Test User',
                role: 'admin',
                created_at: new Date().toISOString()
            }));
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should display sidebar', async ({ page }) => {
        await expect(page.locator('aside')).toBeVisible();
    });

    test('should display header', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
    });

    test('should display main content area', async ({ page }) => {
        await expect(page.locator('main')).toBeVisible();
    });
});
