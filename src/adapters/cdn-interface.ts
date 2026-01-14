// CDN Adapter Interface
// Abstraction layer to support multiple CDN providers

export interface CDNConfig {
    provider: 'cloudflare' | 'aws_cloudfront' | 'fastly' | 'none';
    apiToken?: string;
    zoneId?: string;
    enabled: boolean;
}

export interface TrafficStats {
    requests: {
        total: number;
        cached: number;
        uncached: number;
    };
    bandwidth: {
        total: number;
        cached: number;
        uncached: number;
    };
    threats: {
        total: number;
        country: Record<string, number>;
    };
    pageViews: number;
    uniqueVisitors: number;
    period: {
        start: string;
        end: string;
    };
}

export interface CacheStats {
    hitRate: number;
    bandwidth: {
        saved: number;
        served: number;
    };
    requests: {
        hit: number;
        miss: number;
        expired: number;
        stale: number;
    };
}

export interface CacheRule {
    id: string;
    name: string;
    expression: string;
    action: 'cache' | 'bypass' | 'override';
    ttl?: number;
    enabled: boolean;
}

export interface SSLSettings {
    mode: 'off' | 'flexible' | 'full' | 'strict';
    minVersion: 'TLS 1.0' | 'TLS 1.1' | 'TLS 1.2' | 'TLS 1.3';
    certificateStatus: 'active' | 'pending' | 'expired' | 'none';
    expiresAt?: string;
}

export interface DNSRecord {
    id: string;
    type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS';
    name: string;
    content: string;
    ttl: number;
    proxied: boolean;
}

export interface CDNAdapter {
    readonly name: string;
    readonly enabled: boolean;

    // Analytics
    getTrafficStats(timeRange: string): Promise<TrafficStats>;
    getCacheStats(timeRange: string): Promise<CacheStats>;

    // Cache Management
    purgeAll(): Promise<void>;
    purgeUrls(urls: string[]): Promise<void>;
    purgeTags(tags: string[]): Promise<void>;
    getCacheRules(): Promise<CacheRule[]>;
    createCacheRule(rule: Omit<CacheRule, 'id'>): Promise<CacheRule>;
    updateCacheRule(id: string, rule: Partial<CacheRule>): Promise<CacheRule>;
    deleteCacheRule(id: string): Promise<void>;

    // SSL/TLS
    getSSLSettings(): Promise<SSLSettings>;
    updateSSLSettings(settings: Partial<SSLSettings>): Promise<SSLSettings>;

    // DNS
    getDNSRecords(): Promise<DNSRecord[]>;
    createDNSRecord(record: Omit<DNSRecord, 'id'>): Promise<DNSRecord>;
    updateDNSRecord(id: string, record: Partial<DNSRecord>): Promise<DNSRecord>;
    deleteDNSRecord(id: string): Promise<void>;
}

// Null adapter for when CDN is disabled
export class NullCDNAdapter implements CDNAdapter {
    readonly name = 'none';
    readonly enabled = false;

    async getTrafficStats(): Promise<TrafficStats> {
        return {
            requests: { total: 0, cached: 0, uncached: 0 },
            bandwidth: { total: 0, cached: 0, uncached: 0 },
            threats: { total: 0, country: {} },
            pageViews: 0,
            uniqueVisitors: 0,
            period: { start: '', end: '' },
        };
    }

    async getCacheStats(): Promise<CacheStats> {
        return {
            hitRate: 0,
            bandwidth: { saved: 0, served: 0 },
            requests: { hit: 0, miss: 0, expired: 0, stale: 0 },
        };
    }

    async purgeAll(): Promise<void> { }
    async purgeUrls(): Promise<void> { }
    async purgeTags(): Promise<void> { }
    async getCacheRules(): Promise<CacheRule[]> { return []; }
    async createCacheRule(): Promise<CacheRule> { throw new Error('CDN not configured'); }
    async updateCacheRule(): Promise<CacheRule> { throw new Error('CDN not configured'); }
    async deleteCacheRule(): Promise<void> { throw new Error('CDN not configured'); }
    async getSSLSettings(): Promise<SSLSettings> {
        return { mode: 'off', minVersion: 'TLS 1.2', certificateStatus: 'none' };
    }
    async updateSSLSettings(): Promise<SSLSettings> { throw new Error('CDN not configured'); }
    async getDNSRecords(): Promise<DNSRecord[]> { return []; }
    async createDNSRecord(): Promise<DNSRecord> { throw new Error('CDN not configured'); }
    async updateDNSRecord(): Promise<DNSRecord> { throw new Error('CDN not configured'); }
    async deleteDNSRecord(): Promise<void> { throw new Error('CDN not configured'); }
}
