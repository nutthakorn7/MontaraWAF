// Cloudflare Adapter - Fetches data from Cloudflare API (Optional)

import { TrafficStats, DDoSStats } from '../index';

export class CloudflareAdapter {
    private apiToken: string;
    private zoneId: string;
    private baseUrl = 'https://api.cloudflare.com/client/v4';

    constructor(apiToken: string, zoneId: string) {
        this.apiToken = apiToken;
        this.zoneId = zoneId;
    }

    private async fetch(endpoint: string, options?: RequestInit): Promise<any> {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        const data = await res.json();
        if (!data.success) throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message}`);
        return data.result;
    }

    async getTrafficStats(timeRange: string): Promise<TrafficStats> {
        const hours = parseInt(timeRange.replace('h', '')) || 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        const analytics = await this.fetch(
            `/zones/${this.zoneId}/analytics/dashboard?since=${since}&continuous=true`
        );

        const totals = analytics.totals || {};
        const requests = totals.requests || {};
        const bandwidth = totals.bandwidth || {};

        return {
            totalRequests: requests.all || 0,
            requestsBlocked: requests.cached || 0, // Approximation
            bandwidth: bandwidth.all || 0,
            cacheHitRate: requests.cached / (requests.all || 1) * 100,
            source: 'cloudflare',
        };
    }

    async getDDoSStats(timeRange: string): Promise<DDoSStats> {
        // Cloudflare DDoS analytics (requires paid plan for detailed data)
        const hours = parseInt(timeRange.replace('h', '')) || 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        try {
            const firewall = await this.fetch(
                `/zones/${this.zoneId}/firewall/events?since=${since}&limit=100`
            );

            const ddosEvents = firewall.filter((e: any) =>
                e.action === 'managed_challenge' || e.action === 'block'
            );

            const attackTypes: Record<string, number> = {};
            for (const event of ddosEvents) {
                const type = event.ruleId || 'unknown';
                attackTypes[type] = (attackTypes[type] || 0) + 1;
            }

            return {
                attacks: ddosEvents.length,
                mitigated: ddosEvents.length,
                attackTypes: Object.entries(attackTypes).map(([type, count]) => ({ type, count })),
                source: 'cloudflare',
            };
        } catch (error) {
            return {
                attacks: 0,
                mitigated: 0,
                attackTypes: [],
                source: 'cloudflare',
            };
        }
    }

    async purgeCache(urls?: string[]): Promise<void> {
        await this.fetch(`/zones/${this.zoneId}/purge_cache`, {
            method: 'POST',
            body: JSON.stringify(urls ? { files: urls } : { purge_everything: true }),
        });
    }

    async getCacheRules(): Promise<any[]> {
        return this.fetch(`/zones/${this.zoneId}/cache/rules`);
    }
}
