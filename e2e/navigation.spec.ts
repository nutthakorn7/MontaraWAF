import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
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

    test('should display dashboard', async ({ page }) => {
        // Use more specific selectors
        await expect(page.getByRole('heading', { name: 'Security', exact: true })).toBeVisible();
        await expect(page.getByText('WAF Violations')).toBeVisible();
    });

    test('should navigate to Security Events via URL', async ({ page }) => {
        await page.goto('/security-events');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*security-events/);
    });

    test('should navigate to Attack Analytics via URL', async ({ page }) => {
        await page.goto('/attack-analytics');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*attack-analytics/);
    });

    test('should navigate to Policies via URL', async ({ page }) => {
        await page.goto('/policies');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*policies/);
    });

    test('should navigate to Settings via URL', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*settings/);
    });

    test('should navigate to all main pages without errors', async ({ page }) => {
        const pages = [
            '/security-dashboard',
            '/attack-analytics',
            '/security-events',
            '/policies',
            '/performance',
            '/settings',
        ];

        for (const url of pages) {
            await page.goto(url);
            await page.waitForLoadState('networkidle');
            // Check page title is valid
            const title = await page.title();
            expect(title).toContain('Montara');
        }
    });
});
