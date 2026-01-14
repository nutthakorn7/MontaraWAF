// APISIX Adapter - Fetches data from APISIX Admin API

import { TrafficStats, APIStats } from '../index';

export class APISIXAdapter {
    private adminUrl: string;
    private adminKey: string;

    constructor(adminUrl: string, adminKey: string) {
        this.adminUrl = adminUrl;
        this.adminKey = adminKey;
    }

    private async fetch(endpoint: string): Promise<any> {
        const res = await fetch(`${this.adminUrl}${endpoint}`, {
            headers: {
                'X-API-KEY': this.adminKey,
            },
        });
        if (!res.ok) throw new Error(`APISIX API error: ${res.status}`);
        return res.json();
    }

    async getTrafficStats(timeRange: string): Promise<TrafficStats> {
        // Get Prometheus metrics from APISIX
        const metrics = await this.getPrometheusMetrics();

        return {
            totalRequests: metrics.apisix_http_requests_total || 0,
            requestsBlocked: metrics.apisix_http_status?.['403'] || 0,
            bandwidth: metrics.apisix_bandwidth || 0,
            cacheHitRate: 0, // APISIX doesn't have built-in caching
            source: 'apisix',
        };
    }

    async getAPIStats(timeRange: string): Promise<APIStats> {
        const metrics = await this.getPrometheusMetrics();

        return {
            requests: metrics.apisix_http_requests_total || 0,
            errors: (metrics.apisix_http_status?.['500'] || 0) +
                (metrics.apisix_http_status?.['502'] || 0) +
                (metrics.apisix_http_status?.['503'] || 0),
            latency: {
                avg: metrics.apisix_http_latency_avg || 0,
                p95: metrics.apisix_http_latency_p95 || 0,
                p99: metrics.apisix_http_latency_p99 || 0,
            },
            topEndpoints: [],
            source: 'apisix',
        };
    }

    async getRoutes(): Promise<any[]> {
        const data = await this.fetch('/apisix/admin/routes');
        return data.list || [];
    }

    async getUpstreams(): Promise<any[]> {
        const data = await this.fetch('/apisix/admin/upstreams');
        return data.list || [];
    }

    async getPlugins(): Promise<string[]> {
        const data = await this.fetch('/apisix/admin/plugins/list');
        return data || [];
    }

    async updateRoute(routeId: string, config: any): Promise<void> {
        await fetch(`${this.adminUrl}/apisix/admin/routes/${routeId}`, {
            method: 'PUT',
            headers: {
                'X-API-KEY': this.adminKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });
    }

    private async getPrometheusMetrics(): Promise<Record<string, any>> {
        try {
            const res = await fetch(`${this.adminUrl.replace(':9180', ':9091')}/apisix/prometheus/metrics`);
            const text = await res.text();
            return this.parsePrometheusMetrics(text);
        } catch (error) {
            return {};
        }
    }

    private parsePrometheusMetrics(text: string): Record<string, any> {
        const metrics: Record<string, any> = {};
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.startsWith('#') || !line.trim()) continue;

            const match = line.match(/^(\w+)(?:\{[^}]*\})?\s+(\d+(?:\.\d+)?)/);
            if (match) {
                const [, name, value] = match;
                metrics[name] = parseFloat(value);
            }
        }

        return metrics;
    }
}
