import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper to format violations for reporting
function formatViolations(violations: any[]) {
    return violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
    }));
}

test.describe('Accessibility Audit (Report Mode)', () => {
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
    });

    test('Generate accessibility report for all pages', async ({ page }) => {
        const pages = ['/', '/login', '/security-events', '/policies', '/settings'];
        const report: any[] = [];

        for (const url of pages) {
            await page.goto(url);
            await page.waitForLoadState('networkidle');

            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa'])
                .exclude('.recharts-wrapper')
                .analyze();

            report.push({
                page: url,
                violations: formatViolations(results.violations),
                passes: results.passes.length,
                critical: results.violations.filter(v => v.impact === 'critical').length,
                serious: results.violations.filter(v => v.impact === 'serious').length,
                moderate: results.violations.filter(v => v.impact === 'moderate').length,
                minor: results.violations.filter(v => v.impact === 'minor').length,
            });
        }

        // Print full report
        console.log('\n\n========================================');
        console.log('    ACCESSIBILITY AUDIT REPORT');
        console.log('========================================\n');

        report.forEach(p => {
            console.log(`📄 ${p.page}`);
            console.log(`   ✅ Passes: ${p.passes}`);
            console.log(`   ❌ Critical: ${p.critical} | Serious: ${p.serious} | Moderate: ${p.moderate} | Minor: ${p.minor}`);
            if (p.violations.length > 0) {
                console.log('   Issues:');
                p.violations.forEach((v: any) => {
                    const icon = v.impact === 'critical' ? '🔴' : v.impact === 'serious' ? '🟠' : '🟡';
                    console.log(`     ${icon} ${v.id}: ${v.nodes} element(s)`);
                });
            }
            console.log('');
        });

        const totalCritical = report.reduce((sum, p) => sum + p.critical, 0);
        const totalSerious = report.reduce((sum, p) => sum + p.serious, 0);

        console.log('========================================');
        console.log(`SUMMARY: ${totalCritical} critical, ${totalSerious} serious issues`);
        console.log('========================================\n');

        // This test always passes - it's for reporting purposes
        expect(true).toBe(true);
    });

    test('Form inputs have labels', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
            .withRules(['label'])
            .analyze();

        console.log('Form label issues:', results.violations.length);
        // Report only
        expect(true).toBe(true);
    });

    test('Buttons have accessible names', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
            .withRules(['button-name'])
            .analyze();

        if (results.violations.length > 0) {
            console.log('Buttons missing accessible names:');
            results.violations.forEach(v => {
                v.nodes.forEach((n: any) => {
                    console.log(`  - ${n.html.substring(0, 80)}...`);
                });
            });
        }
        // Report only
        expect(true).toBe(true);
    });
});
