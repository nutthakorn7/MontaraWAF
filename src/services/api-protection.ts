// API Protection Service
// Handles per-endpoint rate limiting, API discovery, schema validation, and API key management

interface EndpointConfig {
    path: string;
    method: string;
    rateLimit: number; // requests per second
    burstSize: number;
    requiresAuth: boolean;
    requiredScopes?: string[]; // Scope-based access
    schema?: Record<string, any>;
    enabled: boolean;
    discoveredAt?: string;
    hitCount: number;
}

interface APIKey {
    id: string;
    key: string;
    name: string;
    scopes: string[];
    rateLimit: number;
    enabled: boolean;
    createdAt: string;
    expiresAt?: string; // Key rotation/expiry
    lastUsed?: string;
    usageCount: number;
}

interface RequestLog {
    path: string;
    method: string;
    timestamp: number;
    ip: string;
    apiKey?: string;
}

export class APIProtectionService {
    private endpoints: Map<string, EndpointConfig> = new Map();
    private apiKeys: Map<string, APIKey> = new Map();
    private requestLogs: RequestLog[] = [];
    private rateLimitCounters: Map<string, { count: number; windowStart: number }> = new Map();

    constructor() {
        // Initialize with default endpoints
        this.addEndpoint({
            path: '/api/v1/auth/login',
            method: 'POST',
            rateLimit: 5,
            burstSize: 10,
            requiresAuth: false,
            enabled: true,
            hitCount: 0,
        });
        this.addEndpoint({
            path: '/api/v1/auth/register',
            method: 'POST',
            rateLimit: 3,
            burstSize: 5,
            requiresAuth: false,
            enabled: true,
            hitCount: 0,
        });
        this.addEndpoint({
            path: '/api/v1/*',
            method: '*',
            rateLimit: 100,
            burstSize: 200,
            requiresAuth: false,
            enabled: true,
            hitCount: 0,
        });

        // Create default API key
        this.createAPIKey('Default Admin Key', ['admin', 'read', 'write'], 1000);
    }

    // Add or update endpoint config
    addEndpoint(config: Omit<EndpointConfig, 'discoveredAt'>): void {
        const key = `${config.method}:${config.path}`;
        this.endpoints.set(key, { ...config, discoveredAt: new Date().toISOString() });
    }

    // Get endpoint config
    getEndpoint(method: string, path: string): EndpointConfig | undefined {
        // Exact match first
        const exactKey = `${method}:${path}`;
        if (this.endpoints.has(exactKey)) {
            return this.endpoints.get(exactKey);
        }

        // Wildcard match
        for (const [key, config] of this.endpoints) {
            const [m, p] = key.split(':');
            if ((m === '*' || m === method) && this.matchPath(path, p)) {
                return config;
            }
        }

        return undefined;
    }

    private matchPath(path: string, pattern: string): boolean {
        if (pattern.endsWith('*')) {
            return path.startsWith(pattern.slice(0, -1));
        }
        return path === pattern;
    }

    // Check rate limit for endpoint
    checkRateLimit(method: string, path: string, ip: string, apiKey?: string): { allowed: boolean; remaining: number; resetIn: number } {
        const endpoint = this.getEndpoint(method, path);
        if (!endpoint || !endpoint.enabled) {
            return { allowed: true, remaining: 100, resetIn: 0 };
        }

        // Use API key rate limit if provided
        let rateLimit = endpoint.rateLimit;
        if (apiKey) {
            const key = this.apiKeys.get(apiKey);
            if (key && key.enabled) {
                rateLimit = key.rateLimit;
                key.lastUsed = new Date().toISOString();
                key.usageCount++;
            }
        }

        const counterKey = `${ip}:${method}:${path}`;
        const now = Date.now();
        const windowMs = 1000; // 1 second window

        let counter = this.rateLimitCounters.get(counterKey);
        if (!counter || now - counter.windowStart > windowMs) {
            counter = { count: 0, windowStart: now };
        }

        counter.count++;
        this.rateLimitCounters.set(counterKey, counter);

        // Update hit count
        endpoint.hitCount++;

        const allowed = counter.count <= rateLimit;
        const remaining = Math.max(0, rateLimit - counter.count);
        const resetIn = Math.max(0, windowMs - (now - counter.windowStart));

        // Log request
        this.logRequest(path, method, ip, apiKey);

        return { allowed, remaining, resetIn };
    }

    // Log request for API discovery
    private logRequest(path: string, method: string, ip: string, apiKey?: string): void {
        this.requestLogs.push({
            path,
            method,
            timestamp: Date.now(),
            ip,
            apiKey,
        });

        // Keep only last 10000 logs
        if (this.requestLogs.length > 10000) {
            this.requestLogs = this.requestLogs.slice(-5000);
        }
    }

    // Discover new endpoints from traffic
    discoverEndpoints(): EndpointConfig[] {
        const discovered: Map<string, { count: number; methods: Set<string> }> = new Map();
        const fiveMinutesAgo = Date.now() - 300000;

        for (const log of this.requestLogs) {
            if (log.timestamp < fiveMinutesAgo) continue;

            const basePath = this.normalizePathForDiscovery(log.path);
            const entry = discovered.get(basePath) || { count: 0, methods: new Set() };
            entry.count++;
            entry.methods.add(log.method);
            discovered.set(basePath, entry);
        }

        const newEndpoints: EndpointConfig[] = [];
        for (const [path, data] of discovered) {
            if (data.count >= 10 && !this.getEndpoint('*', path)) {
                for (const method of data.methods) {
                    const config: EndpointConfig = {
                        path,
                        method,
                        rateLimit: 50,
                        burstSize: 100,
                        requiresAuth: path.includes('admin'),
                        enabled: false, // Discovered but not enabled by default
                        hitCount: data.count,
                        discoveredAt: new Date().toISOString(),
                    };
                    newEndpoints.push(config);
                }
            }
        }

        return newEndpoints;
    }

    private normalizePathForDiscovery(path: string): string {
        // Replace UUIDs and IDs with placeholders
        return path
            .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
            .replace(/\/\d+/g, '/:id');
    }

    // Validate request schema
    validateSchema(method: string, path: string, body: any): { valid: boolean; errors: string[] } {
        const endpoint = this.getEndpoint(method, path);
        if (!endpoint?.schema) {
            return { valid: true, errors: [] };
        }

        const errors: string[] = [];
        const schema = endpoint.schema;

        // Simple validation
        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];
            const fieldRules = rules as any;

            if (fieldRules.required && (value === undefined || value === null)) {
                errors.push(`${field} is required`);
            }

            if (value !== undefined && fieldRules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== fieldRules.type) {
                    errors.push(`${field} must be ${fieldRules.type}`);
                }
            }

            if (typeof value === 'string' && fieldRules.minLength && value.length < fieldRules.minLength) {
                errors.push(`${field} must be at least ${fieldRules.minLength} characters`);
            }

            if (typeof value === 'string' && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors.push(`${field} must be at most ${fieldRules.maxLength} characters`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    // Create API key
    createAPIKey(name: string, scopes: string[], rateLimit: number = 100): APIKey {
        const key: APIKey = {
            id: `key-${Date.now()}`,
            key: this.generateAPIKey(),
            name,
            scopes,
            rateLimit,
            enabled: true,
            createdAt: new Date().toISOString(),
            usageCount: 0,
        };
        this.apiKeys.set(key.key, key);
        return key;
    }

    private generateAPIKey(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'mwaf_';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    // Validate API key
    validateAPIKey(key: string, requiredScope?: string): { valid: boolean; apiKey?: APIKey; error?: string } {
        const apiKey = this.apiKeys.get(key);

        if (!apiKey) {
            return { valid: false, error: 'Invalid API key' };
        }

        if (!apiKey.enabled) {
            return { valid: false, error: 'API key is disabled' };
        }

        if (requiredScope && !apiKey.scopes.includes(requiredScope) && !apiKey.scopes.includes('admin')) {
            return { valid: false, error: `Missing required scope: ${requiredScope}` };
        }

        return { valid: true, apiKey };
    }

    // Get all endpoints
    getEndpoints(): EndpointConfig[] {
        return Array.from(this.endpoints.values());
    }

    // Get all API keys (without the actual key for security)
    getAPIKeys(): Omit<APIKey, 'key'>[] {
        return Array.from(this.apiKeys.values()).map(k => ({
            ...k,
            key: k.key.slice(0, 10) + '...',
        }));
    }

    // Delete API key
    deleteAPIKey(id: string): boolean {
        for (const [key, apiKey] of this.apiKeys) {
            if (apiKey.id === id) {
                this.apiKeys.delete(key);
                return true;
            }
        }
        return false;
    }

    // Get stats
    getStats(): {
        totalEndpoints: number;
        protectedEndpoints: number;
        totalAPIKeys: number;
        activeAPIKeys: number;
        requestsLastHour: number;
    } {
        const hourAgo = Date.now() - 3600000;
        const requestsLastHour = this.requestLogs.filter(r => r.timestamp > hourAgo).length;

        return {
            totalEndpoints: this.endpoints.size,
            protectedEndpoints: Array.from(this.endpoints.values()).filter(e => e.enabled).length,
            totalAPIKeys: this.apiKeys.size,
            activeAPIKeys: Array.from(this.apiKeys.values()).filter(k => k.enabled).length,
            requestsLastHour,
        };
    }

    // === NEW ENHANCEMENTS ===

    // 1. APISIX Sync - Sync rate limits to APISIX
    async syncToAPISIX(): Promise<boolean> {
        try {
            const APISIX_ADMIN_URL = process.env.APISIX_ADMIN_URL || 'http://localhost:9180';
            const APISIX_ADMIN_KEY = process.env.APISIX_ADMIN_KEY || 'montara-admin-key';

            // Get all enabled endpoints and create routes
            for (const endpoint of this.getEndpoints().filter(e => e.enabled)) {
                const routeId = Buffer.from(`${endpoint.method}:${endpoint.path}`).toString('base64').slice(0, 20);

                const routeConfig = {
                    uri: endpoint.path.replace('*', '/*'),
                    methods: endpoint.method === '*' ? ['GET', 'POST', 'PUT', 'DELETE'] : [endpoint.method],
                    plugins: {
                        'limit-req': {
                            rate: endpoint.rateLimit,
                            burst: endpoint.burstSize,
                            key: 'remote_addr',
                            rejected_code: 429,
                            rejected_msg: JSON.stringify({ error: 'Rate limit exceeded', type: 'api_rate_limit' }),
                        },
                    },
                    upstream: {
                        type: 'roundrobin',
                        nodes: { 'localhost:3001': 1 },
                    },
                };

                await fetch(`${APISIX_ADMIN_URL}/apisix/admin/routes/${routeId}`, {
                    method: 'PUT',
                    headers: {
                        'X-API-KEY': APISIX_ADMIN_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(routeConfig),
                });
            }

            console.log('API Protection synced to APISIX');
            return true;
        } catch (error) {
            console.error('APISIX sync error:', error);
            return false;
        }
    }

    // 2. Usage Analytics - Get usage stats per key/endpoint
    getUsageAnalytics(): {
        byEndpoint: { path: string; hits: number; rate: number }[];
        byAPIKey: { name: string; usage: number; lastUsed: string | null }[];
        hourlyTraffic: { hour: number; count: number }[];
    } {
        const hourAgo = Date.now() - 3600000;
        const recentLogs = this.requestLogs.filter(r => r.timestamp > hourAgo);

        // By endpoint
        const endpointHits: Map<string, number> = new Map();
        for (const log of recentLogs) {
            const key = `${log.method}:${log.path}`;
            endpointHits.set(key, (endpointHits.get(key) || 0) + 1);
        }
        const byEndpoint = Array.from(endpointHits.entries())
            .map(([path, hits]) => ({ path, hits, rate: Math.round(hits / 60) }))
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 10);

        // By API key
        const byAPIKey = Array.from(this.apiKeys.values()).map(k => ({
            name: k.name,
            usage: k.usageCount,
            lastUsed: k.lastUsed || null,
        })).sort((a, b) => b.usage - a.usage);

        // Hourly traffic (last 24 hours)
        const hourlyTraffic: { hour: number; count: number }[] = [];
        for (let i = 0; i < 24; i++) {
            const hourStart = Date.now() - ((23 - i) * 3600000);
            const hourEnd = hourStart + 3600000;
            const count = this.requestLogs.filter(r => r.timestamp >= hourStart && r.timestamp < hourEnd).length;
            hourlyTraffic.push({ hour: i, count });
        }

        return { byEndpoint, byAPIKey, hourlyTraffic };
    }

    // 3. Rate Limit Headers - Generate headers for response
    getRateLimitHeaders(method: string, path: string, ip: string): Record<string, string> {
        const result = this.checkRateLimit(method, path, ip);
        return {
            'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 0 : 1)),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + Math.ceil(result.resetIn / 1000)),
        };
    }

    // 4. Check key expiry
    isKeyExpired(key: string): boolean {
        const apiKey = this.apiKeys.get(key);
        if (!apiKey || !apiKey.expiresAt) return false;
        return new Date(apiKey.expiresAt) < new Date();
    }

    // 5. Rotate API key - Create new key with same config, disable old
    rotateAPIKey(id: string, expiresIn?: number): APIKey | null {
        let oldKey: APIKey | undefined;
        let oldKeyString: string = '';

        for (const [key, apiKey] of this.apiKeys) {
            if (apiKey.id === id) {
                oldKey = apiKey;
                oldKeyString = key;
                break;
            }
        }

        if (!oldKey) return null;

        // Create new key with same config
        const newKey = this.createAPIKey(oldKey.name, oldKey.scopes, oldKey.rateLimit);

        // Set expiry if provided (in hours)
        if (expiresIn) {
            newKey.expiresAt = new Date(Date.now() + expiresIn * 3600000).toISOString();
        }

        // Disable old key
        oldKey.enabled = false;

        return newKey;
    }

    // Create API key with expiry
    createAPIKeyWithExpiry(name: string, scopes: string[], rateLimit: number, expiresInHours: number): APIKey {
        const key = this.createAPIKey(name, scopes, rateLimit);
        key.expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();
        return key;
    }

    // Check scope-based access
    checkEndpointAccess(method: string, path: string, apiKey?: string): { allowed: boolean; error?: string } {
        const endpoint = this.getEndpoint(method, path);
        if (!endpoint) return { allowed: true };

        if (!endpoint.requiresAuth) return { allowed: true };
        if (!apiKey) return { allowed: false, error: 'API key required' };

        const key = this.apiKeys.get(apiKey);
        if (!key) return { allowed: false, error: 'Invalid API key' };
        if (!key.enabled) return { allowed: false, error: 'API key disabled' };
        if (this.isKeyExpired(apiKey)) return { allowed: false, error: 'API key expired' };

        // Check required scopes
        if (endpoint.requiredScopes && endpoint.requiredScopes.length > 0) {
            const hasScope = endpoint.requiredScopes.some(s => key.scopes.includes(s) || key.scopes.includes('admin'));
            if (!hasScope) {
                return { allowed: false, error: `Missing required scope: ${endpoint.requiredScopes.join(' or ')}` };
            }
        }

        return { allowed: true };
    }
}

export const apiProtection = new APIProtectionService();

