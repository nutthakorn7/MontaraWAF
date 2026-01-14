// Aggregator Service - Unified API for Dashboard
// Pulls data from Cloudflare, CrowdSec, APISIX, Coraza

import { CloudflareAdapter } from './cloudflare';
import { CrowdSecAdapter } from './crowdsec';
import { APISIXAdapter } from './apisix';
import { CorazaAdapter } from './coraza';

export interface AggregatedStats {
    traffic: TrafficStats;
    security: SecurityStats;
    ddos: DDoSStats;
    bot: BotStats;
    waf: WAFStats;
    api: APIStats;
}

export interface TrafficStats {
    totalRequests: number;
    requestsBlocked: number;
    bandwidth: number;
    cacheHitRate: number;
    source: string;
}

export interface SecurityStats {
    threatsBlocked: number;
    attackTypes: { type: string; count: number }[];
    topAttackers: { ip: string; country: string; attacks: number }[];
    source: string;
}

export interface DDoSStats {
    attacks: number;
    mitigated: number;
    attackTypes: { type: string; count: number }[];
    source: string;
}

export interface BotStats {
    detected: number;
    blocked: number;
    challenged: number;
    botTypes: { type: string; count: number }[];
    source: string;
}

export interface WAFStats {
    events: number;
    blocked: number;
    ruleCategories: { category: string; count: number }[];
    topRules: { ruleId: string; name: string; count: number }[];
    source: string;
}

export interface APIStats {
    requests: number;
    errors: number;
    latency: { avg: number; p95: number; p99: number };
    topEndpoints: { endpoint: string; count: number }[];
    source: string;
}

export interface AggregatorConfig {
    cloudflare?: {
        enabled: boolean;
        apiToken: string;
        zoneId: string;
    };
    crowdsec: {
        enabled: boolean;
        apiUrl: string;
        apiKey: string;
    };
    apisix: {
        enabled: boolean;
        adminUrl: string;
        adminKey: string;
    };
    coraza: {
        enabled: boolean;
        logPath: string;
    };
}

export class Aggregator {
    private cloudflare?: CloudflareAdapter;
    private crowdsec: CrowdSecAdapter;
    private apisix: APISIXAdapter;
    private coraza: CorazaAdapter;

    constructor(config: AggregatorConfig) {
        if (config.cloudflare?.enabled) {
            this.cloudflare = new CloudflareAdapter(
                config.cloudflare.apiToken,
                config.cloudflare.zoneId
            );
        }

        this.crowdsec = new CrowdSecAdapter(
            config.crowdsec.apiUrl,
            config.crowdsec.apiKey
        );

        this.apisix = new APISIXAdapter(
            config.apisix.adminUrl,
            config.apisix.adminKey
        );

        this.coraza = new CorazaAdapter(
            config.coraza.logPath
        );
    }

    async getStats(timeRange: string = '24h'): Promise<AggregatedStats> {
        const [traffic, security, ddos, bot, waf, api] = await Promise.all([
            this.getTrafficStats(timeRange),
            this.getSecurityStats(timeRange),
            this.getDDoSStats(timeRange),
            this.getBotStats(timeRange),
            this.getWAFStats(timeRange),
            this.getAPIStats(timeRange),
        ]);

        return { traffic, security, ddos, bot, waf, api };
    }

    async getTrafficStats(timeRange: string): Promise<TrafficStats> {
        if (this.cloudflare) {
            return this.cloudflare.getTrafficStats(timeRange);
        }
        return this.apisix.getTrafficStats(timeRange);
    }

    async getSecurityStats(timeRange: string): Promise<SecurityStats> {
        const crowdsecStats = await this.crowdsec.getSecurityStats(timeRange);
        const wafStats = await this.coraza.getSecurityStats(timeRange);

        return {
            threatsBlocked: crowdsecStats.threatsBlocked + wafStats.threatsBlocked,
            attackTypes: [...crowdsecStats.attackTypes, ...wafStats.attackTypes],
            topAttackers: crowdsecStats.topAttackers,
            source: 'crowdsec+coraza',
        };
    }

    async getDDoSStats(timeRange: string): Promise<DDoSStats> {
        if (this.cloudflare) {
            const cfStats = await this.cloudflare.getDDoSStats(timeRange);
            const csStats = await this.crowdsec.getDDoSStats(timeRange);
            return {
                attacks: cfStats.attacks + csStats.attacks,
                mitigated: cfStats.mitigated + csStats.mitigated,
                attackTypes: [...cfStats.attackTypes, ...csStats.attackTypes],
                source: 'cloudflare+crowdsec',
            };
        }
        return this.crowdsec.getDDoSStats(timeRange);
    }

    async getBotStats(timeRange: string): Promise<BotStats> {
        return this.crowdsec.getBotStats(timeRange);
    }

    async getWAFStats(timeRange: string): Promise<WAFStats> {
        return this.coraza.getWAFStats(timeRange);
    }

    async getAPIStats(timeRange: string): Promise<APIStats> {
        return this.apisix.getAPIStats(timeRange);
    }

    async getDecisions(): Promise<any[]> {
        return this.crowdsec.getDecisions();
    }

    async addDecision(ip: string, type: string, duration: string): Promise<void> {
        return this.crowdsec.addDecision(ip, type, duration);
    }

    async removeDecision(ip: string): Promise<void> {
        return this.crowdsec.removeDecision(ip);
    }
}
