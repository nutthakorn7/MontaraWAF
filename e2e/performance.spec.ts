import { test, expect } from '@playwright/test';

test.describe('Performance Audit', () => {
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

    test('Dashboard loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        console.log(`\n📊 Dashboard Load Time: ${loadTime}ms`);

        // Should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
    });

    test('Navigation between pages is fast', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const pages = [
            { url: '/security-events', name: 'Security Events' },
            { url: '/policies', name: 'Policies' },
            { url: '/settings', name: 'Settings' },
            { url: '/attack-analytics', name: 'Attack Analytics' },
        ];

        console.log('\n📊 Navigation Performance:');

        for (const p of pages) {
            const startTime = Date.now();
            await page.goto(p.url);
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;

            console.log(`   ${p.name}: ${loadTime}ms`);

            // Each page should load within 2 seconds
            expect(loadTime).toBeLessThan(2000);
        }
    });

    test('Core Web Vitals metrics', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Measure First Contentful Paint (approximate)
        const fcpMetric = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const fcp = entries.find(e => e.name === 'first-contentful-paint');
                    resolve(fcp ? fcp.startTime : null);
                }).observe({ type: 'paint', buffered: true });

                // Fallback timeout
                setTimeout(() => resolve(null), 3000);
            });
        });

        // Get navigation timing
        const timing = await page.evaluate(() => {
            const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                domContentLoaded: perf.domContentLoadedEventEnd - perf.startTime,
                loadEvent: perf.loadEventEnd - perf.startTime,
                domInteractive: perf.domInteractive - perf.startTime,
                ttfb: perf.responseStart - perf.requestStart,
            };
        });

        console.log('\n📊 Core Web Vitals:');
        console.log(`   First Contentful Paint: ${fcpMetric ? `${Math.round(fcpMetric as number)}ms` : 'N/A'}`);
        console.log(`   DOM Interactive: ${Math.round(timing.domInteractive)}ms`);
        console.log(`   DOM Content Loaded: ${Math.round(timing.domContentLoaded)}ms`);
        console.log(`   Load Event: ${Math.round(timing.loadEvent)}ms`);
        console.log(`   Time to First Byte: ${Math.round(timing.ttfb)}ms`);

        // Thresholds
        expect(timing.domInteractive).toBeLessThan(2000);
        expect(timing.domContentLoaded).toBeLessThan(3000);
    });

    test('Bundle size check', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Get all resource sizes
        const resources = await page.evaluate(() => {
            const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            return {
                scripts: entries
                    .filter(e => e.initiatorType === 'script')
                    .reduce((sum, e) => sum + (e.transferSize || 0), 0),
                styles: entries
                    .filter(e => e.initiatorType === 'link' || e.initiatorType === 'css')
                    .reduce((sum, e) => sum + (e.transferSize || 0), 0),
                images: entries
                    .filter(e => e.initiatorType === 'img')
                    .reduce((sum, e) => sum + (e.transferSize || 0), 0),
                total: entries.reduce((sum, e) => sum + (e.transferSize || 0), 0),
            };
        });

        console.log('\n📊 Resource Sizes (transferred):');
        console.log(`   Scripts: ${(resources.scripts / 1024).toFixed(1)} KB`);
        console.log(`   Styles: ${(resources.styles / 1024).toFixed(1)} KB`);
        console.log(`   Images: ${(resources.images / 1024).toFixed(1)} KB`);
        console.log(`   Total: ${(resources.total / 1024).toFixed(1)} KB`);

        // Total transferred should be under 2MB for initial load
        expect(resources.total).toBeLessThan(2 * 1024 * 1024);
    });

    test('Memory usage', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Navigate through several pages
        const pagesToVisit = ['/', '/security-events', '/policies', '/settings', '/'];

        for (const url of pagesToVisit) {
            await page.goto(url);
            await page.waitForLoadState('networkidle');
        }

        // Check memory (if available)
        const memory = await page.evaluate(() => {
            // @ts-ignore
            if (performance.memory) {
                // @ts-ignore
                return performance.memory.usedJSHeapSize / (1024 * 1024);
            }
            return null;
        });

        if (memory) {
            console.log(`\n📊 Memory Usage: ${memory.toFixed(1)} MB`);
            // Memory should stay under 100MB
            expect(memory).toBeLessThan(100);
        } else {
            console.log('\n📊 Memory Usage: Not available in this browser');
        }

        expect(true).toBe(true);
    });
});
