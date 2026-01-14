// Advanced Bot Detection Service
// Good Bot Verification, Fingerprinting, Behavior Analysis

import * as dns from 'dns';
import { promisify } from 'util';

const reverseLookup = promisify(dns.reverse);
const lookup = promisify(dns.lookup);

// Known good bot domains for rDNS verification
const GOOD_BOT_DOMAINS: Record<string, string[]> = {
    googlebot: ['googlebot.com', 'google.com'],
    bingbot: ['search.msn.com'],
    duckduckbot: ['duckduckgo.com'],
    facebookexternalhit: ['facebook.com', 'fbcdn.net'],
    twitterbot: ['twitter.com', 'twttr.com'],
    linkedinbot: ['linkedin.com'],
    slurp: ['crawl.yahoo.net'],
};

interface FingerprintData {
    userAgent: string;
    acceptLanguage: string;
    acceptEncoding: string;
    connection: string;
    dnt: string;
    screenResolution?: string;
    timezone?: string;
    plugins?: string;
    canvas?: string;
    webgl?: string;
}

interface BehaviorMetrics {
    requestsPerMinute: number;
    avgTimeBetweenRequests: number;
    uniqueEndpoints: number;
    hasMouseMovement: boolean;
    hasKeyboardInput: boolean;
    jsChallengeTime: number;
}

export class AdvancedBotDetection {
    private fingerprints: Map<string, { hash: string; count: number; firstSeen: number }> = new Map();
    private behaviorProfiles: Map<string, BehaviorMetrics> = new Map();

    // Verify good bot via reverse DNS
    async verifyGoodBot(ip: string, userAgent: string): Promise<{ verified: boolean; botType: string | null }> {
        try {
            // Extract bot type from User-Agent
            const uaLower = userAgent.toLowerCase();
            let botType: string | null = null;

            for (const [bot, domains] of Object.entries(GOOD_BOT_DOMAINS)) {
                if (uaLower.includes(bot.toLowerCase())) {
                    botType = bot;
                    break;
                }
            }

            if (!botType) {
                return { verified: false, botType: null };
            }

            // Reverse DNS lookup
            const hostnames = await reverseLookup(ip);
            if (!hostnames || hostnames.length === 0) {
                return { verified: false, botType };
            }

            const hostname = hostnames[0];
            const expectedDomains = GOOD_BOT_DOMAINS[botType] || [];

            // Check if hostname ends with expected domain
            const matchesDomain = expectedDomains.some(domain => hostname.endsWith(domain));
            if (!matchesDomain) {
                return { verified: false, botType };
            }

            // Forward DNS lookup to verify
            const resolvedIp = await lookup(hostname);
            const verified = resolvedIp.address === ip;

            return { verified, botType };
        } catch (error) {
            console.error('Good bot verification error:', error);
            return { verified: false, botType: null };
        }
    }

    // Generate device fingerprint hash
    generateFingerprint(data: FingerprintData): string {
        const components = [
            data.userAgent,
            data.acceptLanguage,
            data.acceptEncoding,
            data.connection,
            data.screenResolution || '',
            data.timezone || '',
            data.plugins || '',
        ];

        // Simple hash function
        const str = components.join('|');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Track fingerprint
    trackFingerprint(ip: string, data: FingerprintData): { hash: string; isNew: boolean; count: number } {
        const hash = this.generateFingerprint(data);
        const key = `${ip}:${hash}`;

        const existing = this.fingerprints.get(key);
        if (existing) {
            existing.count++;
            return { hash, isNew: false, count: existing.count };
        }

        this.fingerprints.set(key, { hash, count: 1, firstSeen: Date.now() });
        return { hash, isNew: true, count: 1 };
    }

    // Analyze behavior for bot detection
    analyzeBehavior(ip: string, metrics: Partial<BehaviorMetrics>): { score: number; isBot: boolean; reasons: string[] } {
        const reasons: string[] = [];
        let score = 0;

        // High request rate
        if (metrics.requestsPerMinute && metrics.requestsPerMinute > 60) {
            score += 30;
            reasons.push('High request rate');
        }

        // Too consistent timing (bots are precise)
        if (metrics.avgTimeBetweenRequests !== undefined && metrics.avgTimeBetweenRequests < 100) {
            score += 25;
            reasons.push('Suspiciously consistent timing');
        }

        // No mouse movement
        if (metrics.hasMouseMovement === false) {
            score += 20;
            reasons.push('No mouse movement detected');
        }

        // No keyboard input
        if (metrics.hasKeyboardInput === false) {
            score += 15;
            reasons.push('No keyboard input detected');
        }

        // JS challenge solved too fast (< 500ms is suspicious)
        if (metrics.jsChallengeTime !== undefined && metrics.jsChallengeTime < 500) {
            score += 25;
            reasons.push('Challenge solved too quickly');
        }

        // Too slow (> 30s might be automation)
        if (metrics.jsChallengeTime !== undefined && metrics.jsChallengeTime > 30000) {
            score += 15;
            reasons.push('Challenge solved too slowly');
        }

        return {
            score,
            isBot: score >= 50,
            reasons,
        };
    }

    // Get fingerprint stats
    getFingerprintStats(): { total: number; unique: number; suspicious: number } {
        let suspicious = 0;
        const uniqueHashes = new Set<string>();

        this.fingerprints.forEach(fp => {
            uniqueHashes.add(fp.hash);
            if (fp.count > 100) suspicious++;
        });

        return {
            total: this.fingerprints.size,
            unique: uniqueHashes.size,
            suspicious,
        };
    }

    // Cleanup old entries
    cleanup(): void {
        const hourAgo = Date.now() - 3600000;
        this.fingerprints.forEach((fp, key) => {
            if (fp.firstSeen < hourAgo) {
                this.fingerprints.delete(key);
            }
        });
    }
}

export const advancedBotDetection = new AdvancedBotDetection();
