// API Client for Montara WAF Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types matching Go backend responses
export interface StatsCard {
    label: string;
    value: string;
    change: number;
    changeLabel: string;
}

export interface SubMetric {
    label: string;
    value: string;
    color: string;
}

export interface SecurityMetric {
    label: string;
    value: string;
    change: number;
    subMetrics: SubMetric[];
    links: string[];
}

export interface TimeSeriesPoint {
    time: string;
    wafEvents: number;
    botAttacks: number;
    ddosAttacks: number;
}

export interface TopWebsite {
    website: string;
    events: number;
    change: number;
}

export interface DashboardResponse {
    stats: StatsCard[];
    security: SecurityMetric[];
    timeSeries: TimeSeriesPoint[];
    topWebsites: TopWebsite[];
}

export interface ViolationDistribution {
    allRequests: string;
    requestsBlocked: string;
    wafSessions: string;
    allChange: number;
    blockedChange: number;
    sessionsChange: number;
}

export interface DonutData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

// New types for enhanced Security Dashboard
export interface TopAttacker {
    ip: string;
    country: string;
    flag: string;
    attacks: number;
}

export interface ActionDistribution {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

export interface AttackTimeSeriesPoint {
    hour: string;
    attacks: number;
    blocked: number;
    [key: string]: string | number;
}

export interface TriggeredPolicy {
    policy: string;
    triggers: number;
    severity: string;
}

export interface SecuritySetting {
    type: string;
    sessions: number;
    currentSetting: string;
}

export interface SecurityDashboardResponse {
    distribution: ViolationDistribution;
    violationTypes: DonutData[];
    topAttackers: TopAttacker[];
    actionsBySource: ActionDistribution[];
    attackTimeSeries: AttackTimeSeriesPoint[];
    triggeredPolicies: TriggeredPolicy[];
    securitySettings: SecuritySetting[];
}

export interface AttackAnalytics {
    events: string;
    eventsChange: number;
    incidents: number;
    incidentsChange: number;
    critical: number;
    major: number;
    minor: number;
}

export interface IncidentsByOrigin {
    country: string;
    count: number;
}

export interface Incident {
    id: string;
    severity: string;
    title: string;
    source: string;
    action: string;
    time: string;
    status: string;
}

export interface AttackAnalyticsResponse {
    analytics: AttackAnalytics;
    incidentsByOrigin: IncidentsByOrigin[];
    topViolations: DonutData[];
    attackToolTypes: DonutData[];
    incidents: Incident[];
}

export interface CountryEvents {
    country: string;
    events: number;
}

// Policy types
export interface Policy {
    id: string;
    name: string;
    description: string;
    type: string;
    action: string;
    enabled: boolean;
    severity: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePolicyRequest {
    name: string;
    description: string;
    type: string;
    action: string;
    severity: string;
    enabled: boolean;
}

// Attack Story types
export interface AttackStory {
    id: string;
    title: string;
    severity: string;
    score: number;
    status: string;
    summary: string;
    ai_insights: string[];
    affected_ips: number;
    target_urls: string[];
    attack_types: string[];
    start_time: string;
    duration: string;
}

// API Client Class
class APIClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Health check
    async health(): Promise<{ status: string; version: string }> {
        return this.fetch('/health');
    }

    // Dashboard
    async getDashboard(): Promise<DashboardResponse> {
        return this.fetch('/dashboard');
    }

    // Security Dashboard
    async getSecurityDashboard(): Promise<SecurityDashboardResponse> {
        return this.fetch('/security-dashboard');
    }

    // Attack Analytics
    async getAttackAnalytics(): Promise<AttackAnalyticsResponse> {
        return this.fetch('/attack-analytics');
    }

    // Country Events
    async getCountryEvents(): Promise<CountryEvents[]> {
        return this.fetch('/country-events');
    }

    // Policies
    async listPolicies(): Promise<Policy[]> {
        return this.fetch('/policies');
    }

    async createPolicy(data: CreatePolicyRequest): Promise<Policy> {
        return this.fetch('/policies', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deletePolicy(id: string): Promise<void> {
        await this.fetch(`/policies/${id}`, { method: 'DELETE' });
    }

    // Attack Stories
    async getAttackStories(): Promise<AttackStory[]> {
        return this.fetch('/analytics/stories');
    }

    // DDoS Protection
    async getDDoSStats(): Promise<DDoSResponse> {
        return this.fetch('/edge/ddos');
    }

    // CDN Caching Rules
    async listCachingRules(): Promise<CachingRule[]> {
        return this.fetch('/edge/caching-rules');
    }

    async createCachingRule(data: CreateCachingRuleRequest): Promise<CachingRule> {
        return this.fetch('/edge/caching-rules', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteCachingRule(id: string): Promise<void> {
        await this.fetch(`/edge/caching-rules/${id}`, { method: 'DELETE' });
    }

    // DNS Records
    async listDNSRecords(): Promise<DNSRecord[]> {
        return this.fetch('/edge/dns');
    }

    async createDNSRecord(data: CreateDNSRecordRequest): Promise<DNSRecord> {
        return this.fetch('/edge/dns', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteDNSRecord(id: string): Promise<void> {
        await this.fetch(`/edge/dns/${id}`, { method: 'DELETE' });
    }

    // Reports
    async listReports(): Promise<Report[]> {
        return this.fetch('/analytics/reports');
    }

    async generateReport(data: GenerateReportRequest): Promise<Report> {
        return this.fetch('/analytics/reports/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // IP Management
    async listIPRules(): Promise<IPRule[]> {
        return this.fetch('/edge/ip-rules');
    }

    async createIPRule(data: CreateIPRuleRequest): Promise<IPRule> {
        return this.fetch('/edge/ip-rules', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteIPRule(id: string): Promise<void> {
        await this.fetch(`/edge/ip-rules/${id}`, { method: 'DELETE' });
    }

    // Bot Protection
    async getBotStats(): Promise<BotStats> {
        return this.fetch('/edge/bot/stats');
    }

    async getBotSettings(): Promise<BotSettings> {
        return this.fetch('/edge/bot/settings');
    }

    async updateBotSettings(settings: BotSettings): Promise<BotSettings> {
        return this.fetch('/edge/bot/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    }
}

// CDN Types
export interface CachingRule {
    id: string;
    name: string;
    url_pattern: string;
    cache_level: string;
    ttl: number;
    ignore_query_string: boolean;
    enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCachingRuleRequest {
    name: string;
    url_pattern: string;
    cache_level: string;
    ttl: number;
    ignore_query_string: boolean;
    enabled: boolean;
}

// DNS Types
export interface DNSRecord {
    id: string;
    type: string;
    name: string;
    content: string;
    ttl: number;
    proxied: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateDNSRecordRequest {
    type: string;
    name: string;
    content: string;
    ttl: number;
    proxied: boolean;
}

// DDoS Types
export interface DDoSRule {
    id: string;
    name: string;
    type: string;
    threshold: string;
    action: string;
    enabled: boolean;
}

export interface DDoSStats {
    attacks_blocked: number;
    peak_mitigation: string;
    avg_response_time: string;
    uptime: string;
    protection_mode: string;
}

export interface DDoSResponse {
    stats: DDoSStats;
    rules: DDoSRule[];
}

// Report Types
export interface Report {
    id: string;
    name: string;
    type: string;
    format: string;
    frequency: string;
    status: string;
    url: string;
    created_at: string;
    generated_at: string;
}

export interface GenerateReportRequest {
    type: string;
    format: string;
    frequency: string;
    parameters: Record<string, any>;
}

export interface IPRule {
    id: string;
    ip: string;
    type: string;
    reason: string;
    created_at: string;
}

export interface CreateIPRuleRequest {
    ip: string;
    type: string;
    reason: string;
}

// Bot Protection Types
export interface BotTrafficData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

export interface BotTypeStats {
    type: string;
    count: number;
    status: string;
}

export interface BotWeeklyStats {
    day: string;
    good: number;
    bad: number;
}

export interface BotStats {
    total_bots: string;
    bad_bots_blocked: string;
    challenges_solved: string;
    human_verified: string;
    bot_change: number;
    blocked_change: number;
    traffic_data: BotTrafficData[];
    weekly_data: BotWeeklyStats[];
    bot_types: BotTypeStats[];
}

export interface BotSettings {
    sensitivity: string;
    js_challenge: boolean;
    captcha: boolean;
    device_fingerprint: boolean;
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export { APIClient };
