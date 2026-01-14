// Cloudflare CDN Adapter
// Full implementation of CDN adapter for Cloudflare

import {
    CDNAdapter,
    TrafficStats,
    CacheStats,
    CacheRule,
    SSLSettings,
    DNSRecord,
} from './cdn-interface';

export class CloudflareCDNAdapter implements CDNAdapter {
    readonly name = 'cloudflare';
    readonly enabled = true;

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
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const data = await res.json();
        if (!data.success) {
            throw new Error(
                `Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`
            );
        }
        return data.result;
    }

    // ==================
    // Analytics
    // ==================
    async getTrafficStats(timeRange: string): Promise<TrafficStats> {
        const hours = parseInt(timeRange.replace('h', '')) || 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        const analytics = await this.fetch(
            `/zones/${this.zoneId}/analytics/dashboard?since=${since}&continuous=true`
        );

        const totals = analytics.totals || {};
        const requests = totals.requests || {};
        const bandwidth = totals.bandwidth || {};
        const threats = totals.threats || {};

        return {
            requests: {
                total: requests.all || 0,
                cached: requests.cached || 0,
                uncached: (requests.all || 0) - (requests.cached || 0),
            },
            bandwidth: {
                total: bandwidth.all || 0,
                cached: bandwidth.cached || 0,
                uncached: (bandwidth.all || 0) - (bandwidth.cached || 0),
            },
            threats: {
                total: threats.all || 0,
                country: threats.country || {},
            },
            pageViews: totals.pageviews?.all || 0,
            uniqueVisitors: totals.uniques?.all || 0,
            period: {
                start: since,
                end: new Date().toISOString(),
            },
        };
    }

    async getCacheStats(timeRange: string): Promise<CacheStats> {
        const traffic = await this.getTrafficStats(timeRange);

        const hitRate =
            traffic.requests.total > 0
                ? (traffic.requests.cached / traffic.requests.total) * 100
                : 0;

        return {
            hitRate,
            bandwidth: {
                saved: traffic.bandwidth.cached,
                served: traffic.bandwidth.total,
            },
            requests: {
                hit: traffic.requests.cached,
                miss: traffic.requests.uncached,
                expired: 0, // Not available in basic analytics
                stale: 0,
            },
        };
    }

    // ==================
    // Cache Management
    // ==================
    async purgeAll(): Promise<void> {
        await this.fetch(`/zones/${this.zoneId}/purge_cache`, {
            method: 'POST',
            body: JSON.stringify({ purge_everything: true }),
        });
    }

    async purgeUrls(urls: string[]): Promise<void> {
        await this.fetch(`/zones/${this.zoneId}/purge_cache`, {
            method: 'POST',
            body: JSON.stringify({ files: urls }),
        });
    }

    async purgeTags(tags: string[]): Promise<void> {
        await this.fetch(`/zones/${this.zoneId}/purge_cache`, {
            method: 'POST',
            body: JSON.stringify({ tags }),
        });
    }

    async getCacheRules(): Promise<CacheRule[]> {
        const rules = await this.fetch(`/zones/${this.zoneId}/rulesets`);

        const cacheRuleset = rules.find((r: any) => r.phase === 'http_request_cache_settings');
        if (!cacheRuleset) return [];

        const ruleset = await this.fetch(
            `/zones/${this.zoneId}/rulesets/${cacheRuleset.id}`
        );

        return (ruleset.rules || []).map((rule: any) => ({
            id: rule.id,
            name: rule.description || 'Unnamed rule',
            expression: rule.expression,
            action: rule.action === 'set_cache_settings' ? 'cache' : 'bypass',
            ttl: rule.action_parameters?.cache?.edge_ttl?.default,
            enabled: rule.enabled,
        }));
    }

    async createCacheRule(rule: Omit<CacheRule, 'id'>): Promise<CacheRule> {
        const rulesets = await this.fetch(`/zones/${this.zoneId}/rulesets`);
        let cacheRuleset = rulesets.find((r: any) => r.phase === 'http_request_cache_settings');

        if (!cacheRuleset) {
            cacheRuleset = await this.fetch(`/zones/${this.zoneId}/rulesets`, {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Cache Rules',
                    kind: 'zone',
                    phase: 'http_request_cache_settings',
                    rules: [],
                }),
            });
        }

        const newRule = await this.fetch(
            `/zones/${this.zoneId}/rulesets/${cacheRuleset.id}/rules`,
            {
                method: 'POST',
                body: JSON.stringify({
                    description: rule.name,
                    expression: rule.expression,
                    action: rule.action === 'cache' ? 'set_cache_settings' : 'bypass_cache',
                    enabled: rule.enabled,
                    action_parameters:
                        rule.action === 'cache'
                            ? { cache: { edge_ttl: { default: rule.ttl || 3600 } } }
                            : undefined,
                }),
            }
        );

        return {
            id: newRule.id,
            name: rule.name,
            expression: rule.expression,
            action: rule.action,
            ttl: rule.ttl,
            enabled: rule.enabled,
        };
    }

    async updateCacheRule(id: string, rule: Partial<CacheRule>): Promise<CacheRule> {
        const rulesets = await this.fetch(`/zones/${this.zoneId}/rulesets`);
        const cacheRuleset = rulesets.find((r: any) => r.phase === 'http_request_cache_settings');

        if (!cacheRuleset) throw new Error('Cache ruleset not found');

        const updated = await this.fetch(
            `/zones/${this.zoneId}/rulesets/${cacheRuleset.id}/rules/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    description: rule.name,
                    expression: rule.expression,
                    enabled: rule.enabled,
                }),
            }
        );

        return {
            id: updated.id,
            name: rule.name || '',
            expression: rule.expression || '',
            action: rule.action || 'cache',
            ttl: rule.ttl,
            enabled: rule.enabled ?? true,
        };
    }

    async deleteCacheRule(id: string): Promise<void> {
        const rulesets = await this.fetch(`/zones/${this.zoneId}/rulesets`);
        const cacheRuleset = rulesets.find((r: any) => r.phase === 'http_request_cache_settings');

        if (!cacheRuleset) throw new Error('Cache ruleset not found');

        await this.fetch(
            `/zones/${this.zoneId}/rulesets/${cacheRuleset.id}/rules/${id}`,
            { method: 'DELETE' }
        );
    }

    // ==================
    // SSL/TLS
    // ==================
    async getSSLSettings(): Promise<SSLSettings> {
        const [ssl, minTls, cert] = await Promise.all([
            this.fetch(`/zones/${this.zoneId}/settings/ssl`),
            this.fetch(`/zones/${this.zoneId}/settings/min_tls_version`),
            this.fetch(`/zones/${this.zoneId}/ssl/certificate_packs`).catch(() => []),
        ]);

        const activeCert = cert.find?.((c: any) => c.status === 'active');

        return {
            mode: ssl.value as SSLSettings['mode'],
            minVersion: minTls.value as SSLSettings['minVersion'],
            certificateStatus: activeCert ? 'active' : 'none',
            expiresAt: activeCert?.certificates?.[0]?.expires_on,
        };
    }

    async updateSSLSettings(settings: Partial<SSLSettings>): Promise<SSLSettings> {
        if (settings.mode) {
            await this.fetch(`/zones/${this.zoneId}/settings/ssl`, {
                method: 'PATCH',
                body: JSON.stringify({ value: settings.mode }),
            });
        }

        if (settings.minVersion) {
            await this.fetch(`/zones/${this.zoneId}/settings/min_tls_version`, {
                method: 'PATCH',
                body: JSON.stringify({ value: settings.minVersion }),
            });
        }

        return this.getSSLSettings();
    }

    // ==================
    // DNS
    // ==================
    async getDNSRecords(): Promise<DNSRecord[]> {
        const records = await this.fetch(`/zones/${this.zoneId}/dns_records`);

        return records.map((r: any) => ({
            id: r.id,
            type: r.type,
            name: r.name,
            content: r.content,
            ttl: r.ttl,
            proxied: r.proxied,
        }));
    }

    async createDNSRecord(record: Omit<DNSRecord, 'id'>): Promise<DNSRecord> {
        const result = await this.fetch(`/zones/${this.zoneId}/dns_records`, {
            method: 'POST',
            body: JSON.stringify(record),
        });

        return {
            id: result.id,
            type: result.type,
            name: result.name,
            content: result.content,
            ttl: result.ttl,
            proxied: result.proxied,
        };
    }

    async updateDNSRecord(id: string, record: Partial<DNSRecord>): Promise<DNSRecord> {
        const result = await this.fetch(`/zones/${this.zoneId}/dns_records/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(record),
        });

        return {
            id: result.id,
            type: result.type,
            name: result.name,
            content: result.content,
            ttl: result.ttl,
            proxied: result.proxied,
        };
    }

    async deleteDNSRecord(id: string): Promise<void> {
        await this.fetch(`/zones/${this.zoneId}/dns_records/${id}`, {
            method: 'DELETE',
        });
    }
}
