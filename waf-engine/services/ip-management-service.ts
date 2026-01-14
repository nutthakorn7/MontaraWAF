// IP Management Service
// Whitelist, Blacklist, and Geo-blocking via CrowdSec

export interface IPEntry {
    id: string;
    ip: string;
    type: 'whitelist' | 'blacklist';
    reason?: string;
    duration?: string;
    country?: string;
    createdAt: string;
    expiresAt?: string;
    createdBy?: string;
}

export interface GeoRule {
    id: string;
    countryCode: string;
    countryName: string;
    action: 'allow' | 'block' | 'challenge';
    enabled: boolean;
    createdAt: string;
}

export interface IPStats {
    totalBlocked: number;
    totalWhitelisted: number;
    blockedByCountry: Record<string, number>;
    recentBlocks: IPEntry[];
}

const CROWDSEC_API_URL = process.env.CROWDSEC_API_URL || 'http://localhost:18080';
const CROWDSEC_API_KEY = process.env.CROWDSEC_BOUNCER_KEY || '';

export class IPManagementService {
    private apiUrl: string;
    private apiKey: string;

    constructor(apiUrl?: string, apiKey?: string) {
        this.apiUrl = apiUrl || CROWDSEC_API_URL;
        this.apiKey = apiKey || CROWDSEC_API_KEY;
    }

    private async fetch(endpoint: string, options?: RequestInit): Promise<any> {
        const res = await fetch(`${this.apiUrl}${endpoint}`, {
            ...options,
            headers: {
                'X-Api-Key': this.apiKey,
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`CrowdSec API error: ${res.status} - ${text}`);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }

    // ==================
    // Blacklist (Ban)
    // ==================
    async addToBlacklist(ip: string, reason?: string, duration?: string): Promise<void> {
        await this.fetch('/v1/decisions', {
            method: 'POST',
            body: JSON.stringify([{
                duration: duration || '24h',
                origin: 'montara-dashboard',
                scenario: reason || 'manual_ban',
                scope: 'ip',
                type: 'ban',
                value: ip,
            }]),
        });
    }

    async removeFromBlacklist(ip: string): Promise<void> {
        await this.fetch(`/v1/decisions?ip=${ip}`, {
            method: 'DELETE',
        });
    }

    async getBlacklist(): Promise<IPEntry[]> {
        const decisions = await this.fetch('/v1/decisions?type=ban') || [];

        return decisions.map((d: any) => ({
            id: d.id?.toString() || `ban-${d.value}`,
            ip: d.value,
            type: 'blacklist' as const,
            reason: d.scenario,
            duration: d.duration,
            country: d.origin,
            createdAt: d.created_at || new Date().toISOString(),
            expiresAt: d.until,
        }));
    }

    // ==================
    // Whitelist (Allow)
    // ==================
    // CrowdSec uses "exclude" decisions or local config for whitelisting
    async addToWhitelist(ip: string, reason?: string): Promise<void> {
        // For whitelist, we add a decision with type "captcha" with 0s duration
        // or use a custom type. In practice, whitelists are often configured
        // via CrowdSec's local config or bouncer config.
        await this.fetch('/v1/decisions', {
            method: 'POST',
            body: JSON.stringify([{
                duration: '87600h', // 10 years
                origin: 'montara-whitelist',
                scenario: reason || 'manual_whitelist',
                scope: 'ip',
                type: 'captcha', // Using captcha with very long duration as "allow"
                value: ip,
            }]),
        });
    }

    async removeFromWhitelist(ip: string): Promise<void> {
        await this.fetch(`/v1/decisions?ip=${ip}&origin=montara-whitelist`, {
            method: 'DELETE',
        });
    }

    async getWhitelist(): Promise<IPEntry[]> {
        const decisions = await this.fetch('/v1/decisions?origin=montara-whitelist') || [];

        return decisions.map((d: any) => ({
            id: d.id?.toString() || `allow-${d.value}`,
            ip: d.value,
            type: 'whitelist' as const,
            reason: d.scenario,
            createdAt: d.created_at || new Date().toISOString(),
        }));
    }

    // ==================
    // All Decisions
    // ==================
    async getAllDecisions(): Promise<IPEntry[]> {
        const decisions = await this.fetch('/v1/decisions') || [];

        return decisions.map((d: any) => ({
            id: d.id?.toString() || `${d.type}-${d.value}`,
            ip: d.value,
            type: d.origin === 'montara-whitelist' ? 'whitelist' : 'blacklist' as 'whitelist' | 'blacklist',
            reason: d.scenario,
            duration: d.duration,
            createdAt: d.created_at || new Date().toISOString(),
            expiresAt: d.until,
        }));
    }

    // ==================
    // Geo-blocking
    // ==================
    async blockCountry(countryCode: string, reason?: string): Promise<void> {
        await this.fetch('/v1/decisions', {
            method: 'POST',
            body: JSON.stringify([{
                duration: '87600h',
                origin: 'montara-geo',
                scenario: reason || `geo_block_${countryCode}`,
                scope: 'country',
                type: 'ban',
                value: countryCode.toUpperCase(),
            }]),
        });
    }

    async unblockCountry(countryCode: string): Promise<void> {
        await this.fetch(`/v1/decisions?scope=country&value=${countryCode.toUpperCase()}`, {
            method: 'DELETE',
        });
    }

    async getBlockedCountries(): Promise<GeoRule[]> {
        const decisions = await this.fetch('/v1/decisions?scope=country') || [];

        return decisions.map((d: any) => ({
            id: d.id?.toString() || `geo-${d.value}`,
            countryCode: d.value,
            countryName: this.getCountryName(d.value),
            action: 'block' as const,
            enabled: true,
            createdAt: d.created_at || new Date().toISOString(),
        }));
    }

    // ==================
    // Stats
    // ==================
    async getStats(): Promise<IPStats> {
        const [blacklist, whitelist] = await Promise.all([
            this.getBlacklist(),
            this.getWhitelist(),
        ]);

        const blockedByCountry: Record<string, number> = {};
        for (const entry of blacklist) {
            if (entry.country) {
                blockedByCountry[entry.country] = (blockedByCountry[entry.country] || 0) + 1;
            }
        }

        return {
            totalBlocked: blacklist.length,
            totalWhitelisted: whitelist.length,
            blockedByCountry,
            recentBlocks: blacklist.slice(0, 10),
        };
    }

    private getCountryName(code: string): string {
        const countries: Record<string, string> = {
            US: 'United States', CN: 'China', RU: 'Russia', DE: 'Germany',
            FR: 'France', GB: 'United Kingdom', JP: 'Japan', KR: 'South Korea',
            BR: 'Brazil', IN: 'India', AU: 'Australia', CA: 'Canada',
            NL: 'Netherlands', SG: 'Singapore', HK: 'Hong Kong', TW: 'Taiwan',
        };
        return countries[code.toUpperCase()] || code;
    }
}
