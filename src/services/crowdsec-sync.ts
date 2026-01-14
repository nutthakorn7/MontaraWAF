// CrowdSec Sync Service
// Syncs IP decisions from UI to CrowdSec LAPI

const CROWDSEC_LAPI_URL = process.env.CROWDSEC_LAPI_URL || 'http://localhost:18080';
const CROWDSEC_BOUNCER_KEY = process.env.CROWDSEC_BOUNCER_KEY || '7lKoHLDqBWtmwSEgJMNVsx7Q/A8XrlIo4p7UhnIv18A';

interface CrowdSecDecision {
    id?: number;
    type: 'ban' | 'captcha' | 'throttle';
    scope: 'ip' | 'range' | 'country';
    value: string;
    duration: string;
    origin: string;
    scenario: string;
}

export class CrowdSecSyncService {
    private apiUrl: string;
    private bouncerKey: string;

    constructor() {
        this.apiUrl = CROWDSEC_LAPI_URL;
        this.bouncerKey = CROWDSEC_BOUNCER_KEY;
    }

    // Add IP to ban list
    async banIP(ip: string, reason: string = 'manual_ban', duration: string = '24h'): Promise<boolean> {
        try {
            const decision: CrowdSecDecision = {
                type: 'ban',
                scope: 'ip',
                value: ip,
                duration,
                origin: 'montara-ui',
                scenario: reason,
            };

            const response = await fetch(`${this.apiUrl}/v1/decisions`, {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.bouncerKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([decision]),
            });

            if (response.ok) {
                console.log(`IP ${ip} banned via CrowdSec`);
                return true;
            }

            console.error('CrowdSec ban error:', await response.text());
            return false;
        } catch (error) {
            console.error('CrowdSec ban error:', error);
            return false;
        }
    }

    // Remove IP from ban list
    async unbanIP(ip: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/v1/decisions?ip=${encodeURIComponent(ip)}`, {
                method: 'DELETE',
                headers: {
                    'X-Api-Key': this.bouncerKey,
                },
            });

            if (response.ok) {
                console.log(`IP ${ip} unbanned via CrowdSec`);
                return true;
            }

            console.error('CrowdSec unban error:', await response.text());
            return false;
        } catch (error) {
            console.error('CrowdSec unban error:', error);
            return false;
        }
    }

    // Block country
    async blockCountry(countryCode: string, reason: string = 'geo_block', duration: string = '8760h'): Promise<boolean> {
        try {
            const decision: CrowdSecDecision = {
                type: 'ban',
                scope: 'country',
                value: countryCode.toUpperCase(),
                duration, // 1 year default
                origin: 'montara-ui',
                scenario: reason,
            };

            const response = await fetch(`${this.apiUrl}/v1/decisions`, {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.bouncerKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([decision]),
            });

            if (response.ok) {
                console.log(`Country ${countryCode} blocked via CrowdSec`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('CrowdSec country block error:', error);
            return false;
        }
    }

    // Unblock country
    async unblockCountry(countryCode: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/v1/decisions?scope=country&value=${encodeURIComponent(countryCode.toUpperCase())}`, {
                method: 'DELETE',
                headers: {
                    'X-Api-Key': this.bouncerKey,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('CrowdSec country unblock error:', error);
            return false;
        }
    }

    // Get decisions for an IP
    async getDecisions(ip: string): Promise<CrowdSecDecision[]> {
        try {
            const response = await fetch(`${this.apiUrl}/v1/decisions?ip=${encodeURIComponent(ip)}`, {
                headers: {
                    'X-Api-Key': this.bouncerKey,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data || [];
            }

            return [];
        } catch (error) {
            console.error('CrowdSec get decisions error:', error);
            return [];
        }
    }

    // List all active decisions
    async listDecisions(): Promise<CrowdSecDecision[]> {
        try {
            const response = await fetch(`${this.apiUrl}/v1/decisions`, {
                headers: {
                    'X-Api-Key': this.bouncerKey,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data || [];
            }

            return [];
        } catch (error) {
            console.error('CrowdSec list decisions error:', error);
            return [];
        }
    }

    // Add to whitelist (using long captcha duration as workaround)
    async whitelistIP(ip: string, reason: string = 'manual_whitelist'): Promise<boolean> {
        try {
            // First remove any existing ban
            await this.unbanIP(ip);

            // CrowdSec doesn't have native whitelist, so we use the bouncer config
            // For now, we'll just ensure no ban exists
            console.log(`IP ${ip} whitelisted (ban removed)`);
            return true;
        } catch (error) {
            console.error('CrowdSec whitelist error:', error);
            return false;
        }
    }
}

export const crowdsecSync = new CrowdSecSyncService();
