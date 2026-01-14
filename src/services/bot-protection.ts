// Bot Detection & Protection Service
// Handles bot detection, UA management, and APISIX sync

interface BotRule {
    id: string;
    pattern: string;
    type: 'block' | 'allow' | 'challenge';
    category: 'crawler' | 'scraper' | 'attack_tool' | 'automation' | 'good_bot';
    enabled: boolean;
    hitCount: number;
    createdAt: string;
}

interface BotStats {
    totalBotRequests: number;
    blockedBots: number;
    challengedBots: number;
    allowedGoodBots: number;
    topBotTypes: { type: string; count: number }[];
    recentBots: { ip: string; ua: string; blocked: boolean; timestamp: string }[];
}

// Default bot rules (bad bots)
const defaultBadBots: Omit<BotRule, 'id' | 'hitCount' | 'createdAt'>[] = [
    { pattern: 'sqlmap*', type: 'block', category: 'attack_tool', enabled: true },
    { pattern: 'Nikto*', type: 'block', category: 'attack_tool', enabled: true },
    { pattern: 'dirbuster*', type: 'block', category: 'attack_tool', enabled: true },
    { pattern: 'masscan*', type: 'block', category: 'attack_tool', enabled: true },
    { pattern: 'nmap*', type: 'block', category: 'attack_tool', enabled: true },
    { pattern: 'zgrab*', type: 'block', category: 'attack_tool', enabled: true },
    { pattern: 'python-requests*', type: 'block', category: 'automation', enabled: true },
    { pattern: 'Go-http-client*', type: 'block', category: 'automation', enabled: true },
    { pattern: 'curl*', type: 'block', category: 'automation', enabled: true },
    { pattern: 'Wget*', type: 'block', category: 'automation', enabled: true },
    { pattern: 'MJ12bot*', type: 'block', category: 'crawler', enabled: true },
    { pattern: 'AhrefsBot*', type: 'block', category: 'crawler', enabled: true },
    { pattern: 'SemrushBot*', type: 'block', category: 'crawler', enabled: true },
    { pattern: 'DotBot*', type: 'block', category: 'crawler', enabled: true },
    { pattern: 'PetalBot*', type: 'block', category: 'crawler', enabled: true },
    { pattern: 'BLEXBot*', type: 'block', category: 'scraper', enabled: true },
    { pattern: 'DataForSeoBot*', type: 'block', category: 'scraper', enabled: true },
];

// Good bots (allowed)
const defaultGoodBots: Omit<BotRule, 'id' | 'hitCount' | 'createdAt'>[] = [
    { pattern: 'Googlebot*', type: 'allow', category: 'good_bot', enabled: true },
    { pattern: 'Bingbot*', type: 'allow', category: 'good_bot', enabled: true },
    { pattern: 'Slurp*', type: 'allow', category: 'good_bot', enabled: true },
    { pattern: 'DuckDuckBot*', type: 'allow', category: 'good_bot', enabled: true },
    { pattern: 'facebookexternalhit*', type: 'allow', category: 'good_bot', enabled: true },
    { pattern: 'Twitterbot*', type: 'allow', category: 'good_bot', enabled: true },
    { pattern: 'LinkedInBot*', type: 'allow', category: 'good_bot', enabled: true },
];

export class BotProtectionService {
    private rules: BotRule[] = [];
    private stats: BotStats = {
        totalBotRequests: 0,
        blockedBots: 0,
        challengedBots: 0,
        allowedGoodBots: 0,
        topBotTypes: [],
        recentBots: [],
    };
    private botTypeHits: Map<string, number> = new Map();

    constructor() {
        // Initialize with default rules
        [...defaultBadBots, ...defaultGoodBots].forEach((rule, i) => {
            this.rules.push({
                id: `bot-${i + 1}`,
                ...rule,
                hitCount: 0,
                createdAt: new Date().toISOString(),
            });
        });
    }

    // Check if User-Agent is a bot
    checkBot(userAgent: string, ip: string): 'block' | 'allow' | 'challenge' {
        const ua = userAgent.toLowerCase();

        // Check good bots first
        for (const rule of this.rules.filter(r => r.enabled && r.type === 'allow')) {
            if (this.matchPattern(ua, rule.pattern.toLowerCase())) {
                this.recordHit(rule, ip, userAgent, false);
                return 'allow';
            }
        }

        // Check bad bots
        for (const rule of this.rules.filter(r => r.enabled && r.type === 'block')) {
            if (this.matchPattern(ua, rule.pattern.toLowerCase())) {
                this.recordHit(rule, ip, userAgent, true);
                return 'block';
            }
        }

        // Check challenge rules
        for (const rule of this.rules.filter(r => r.enabled && r.type === 'challenge')) {
            if (this.matchPattern(ua, rule.pattern.toLowerCase())) {
                this.recordHit(rule, ip, userAgent, false);
                return 'challenge';
            }
        }

        // Unknown UA - allow but track
        this.stats.totalBotRequests++;
        return 'allow';
    }

    private matchPattern(ua: string, pattern: string): boolean {
        // Convert glob pattern to regex
        const regex = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp(`^${regex}`, 'i').test(ua);
    }

    private recordHit(rule: BotRule, ip: string, ua: string, blocked: boolean): void {
        rule.hitCount++;
        this.stats.totalBotRequests++;

        if (blocked) {
            this.stats.blockedBots++;
        } else if (rule.type === 'allow' && rule.category === 'good_bot') {
            this.stats.allowedGoodBots++;
        }

        // Track by type
        const typeCount = this.botTypeHits.get(rule.category) || 0;
        this.botTypeHits.set(rule.category, typeCount + 1);

        // Add to recent
        this.stats.recentBots.unshift({
            ip,
            ua: ua.slice(0, 100),
            blocked,
            timestamp: new Date().toISOString(),
        });

        // Keep only last 50
        if (this.stats.recentBots.length > 50) {
            this.stats.recentBots.pop();
        }
    }

    // Get current stats
    getStats(): BotStats {
        const topBotTypes = Array.from(this.botTypeHits.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);

        return {
            ...this.stats,
            topBotTypes,
        };
    }

    // Get all rules
    getRules(): BotRule[] {
        return this.rules;
    }

    // Add new rule
    addRule(rule: Omit<BotRule, 'id' | 'hitCount' | 'createdAt'>): BotRule {
        const newRule: BotRule = {
            id: `bot-${Date.now()}`,
            ...rule,
            hitCount: 0,
            createdAt: new Date().toISOString(),
        };
        this.rules.push(newRule);
        return newRule;
    }

    // Update rule
    updateRule(id: string, updates: Partial<BotRule>): BotRule | null {
        const index = this.rules.findIndex(r => r.id === id);
        if (index === -1) return null;

        this.rules[index] = { ...this.rules[index], ...updates };
        return this.rules[index];
    }

    // Delete rule
    deleteRule(id: string): boolean {
        const index = this.rules.findIndex(r => r.id === id);
        if (index === -1) return false;

        this.rules.splice(index, 1);
        return true;
    }

    // Get APISIX denylist format
    getAPISIXDenylist(): string[] {
        return this.rules
            .filter(r => r.enabled && r.type === 'block')
            .map(r => r.pattern);
    }

    // Sync to APISIX (returns denylist for the route config)
    async syncToAPISIX(): Promise<boolean> {
        try {
            const denylist = this.getAPISIXDenylist();

            // Update APISIX via Admin API
            const APISIX_ADMIN_URL = process.env.APISIX_ADMIN_URL || 'http://localhost:9180';
            const APISIX_ADMIN_KEY = process.env.APISIX_ADMIN_KEY || 'montara-admin-key';

            const response = await fetch(`${APISIX_ADMIN_URL}/apisix/admin/routes/1`, {
                headers: { 'X-API-KEY': APISIX_ADMIN_KEY },
            });

            if (!response.ok) return false;

            const routeData = await response.json();
            const route = routeData.value || routeData;

            // Update ua-restriction plugin
            if (!route.plugins) route.plugins = {};
            route.plugins['ua-restriction'] = {
                denylist,
                bypass_missing: false,
                message: '{"error": "Bot blocked by WAF", "code": 403}',
            };

            const updateResponse = await fetch(`${APISIX_ADMIN_URL}/apisix/admin/routes/1`, {
                method: 'PUT',
                headers: {
                    'X-API-KEY': APISIX_ADMIN_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(route),
            });

            console.log('Bot rules synced to APISIX:', updateResponse.ok);
            return updateResponse.ok;
        } catch (error) {
            console.error('APISIX sync error:', error);
            return false;
        }
    }
}

// Singleton instance
export const botProtection = new BotProtectionService();
