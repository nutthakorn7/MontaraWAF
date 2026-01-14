// DDoS Mitigation Service
// Handles rate limiting, traffic analysis, and auto-mitigation

interface RateLimitConfig {
    requestsPerSecond: number;
    burstSize: number;
    blockDuration: number; // seconds
    challengeThreshold: number;
}

interface IPTracker {
    requests: number[];
    blocked: boolean;
    blockedUntil?: number;
    challenged: boolean;
}

interface DDoSStats {
    totalRequests: number;
    blockedRequests: number;
    challengedRequests: number;
    activeBlocks: number;
    topAttackers: { ip: string; requests: number }[];
    requestsPerSecond: number;
    isUnderAttack: boolean;
    mitigationMode: 'off' | 'auto' | 'challenge' | 'block';
}

export class DDoSMitigationService {
    private config: RateLimitConfig;
    private baseConfig: RateLimitConfig; // Original config for scaling reference
    private ipTrackers: Map<string, IPTracker> = new Map();
    private globalStats = {
        totalRequests: 0,
        blockedRequests: 0,
        challengedRequests: 0,
    };
    private mitigationMode: 'off' | 'auto' | 'challenge' | 'block' = 'auto';
    private cleanupInterval: NodeJS.Timeout | null = null;
    private autoScaleInterval: NodeJS.Timeout | null = null;
    private autoScaleEnabled: boolean = true;
    private trafficHistory: number[] = [];
    private currentScaleLevel: 'normal' | 'elevated' | 'high' | 'extreme' = 'normal';

    constructor(config?: Partial<RateLimitConfig>) {
        this.baseConfig = {
            requestsPerSecond: 100,
            burstSize: 200,
            blockDuration: 300, // 5 minutes
            challengeThreshold: 50, // Challenge at 50% of limit
            ...config,
        };
        this.config = { ...this.baseConfig };

        // Cleanup old entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);

        // Auto-scale check every 10 seconds
        this.autoScaleInterval = setInterval(() => this.autoScale(), 10000);
    }

    // Auto-scale rate limits based on traffic
    private autoScale(): void {
        if (!this.autoScaleEnabled) return;

        const stats = this.getStats();
        this.trafficHistory.push(stats.requestsPerSecond);

        // Keep last 30 samples (5 minutes)
        if (this.trafficHistory.length > 30) {
            this.trafficHistory.shift();
        }

        // Calculate average and peak
        const avgTraffic = this.trafficHistory.reduce((a, b) => a + b, 0) / this.trafficHistory.length;
        const peakTraffic = Math.max(...this.trafficHistory);
        const baseLimit = this.baseConfig.requestsPerSecond;

        // Determine scale level
        let newLevel: 'normal' | 'elevated' | 'high' | 'extreme' = 'normal';
        let multiplier = 1;

        if (stats.isUnderAttack || peakTraffic > baseLimit * 2) {
            newLevel = 'extreme';
            multiplier = 0.25; // 25% of base limit
        } else if (avgTraffic > baseLimit * 0.8 || stats.activeBlocks > 10) {
            newLevel = 'high';
            multiplier = 0.5; // 50% of base limit
        } else if (avgTraffic > baseLimit * 0.5 || stats.activeBlocks > 3) {
            newLevel = 'elevated';
            multiplier = 0.75; // 75% of base limit
        } else if (avgTraffic < baseLimit * 0.2 && stats.activeBlocks === 0) {
            newLevel = 'normal';
            multiplier = 1.5; // 150% of base limit (relaxed)
        }

        // Apply scaling if level changed
        if (newLevel !== this.currentScaleLevel) {
            this.currentScaleLevel = newLevel;
            this.config = {
                ...this.baseConfig,
                requestsPerSecond: Math.round(this.baseConfig.requestsPerSecond * multiplier),
                burstSize: Math.round(this.baseConfig.burstSize * multiplier),
                challengeThreshold: Math.round(this.baseConfig.challengeThreshold * multiplier),
            };
            console.log(`[AutoScale] Level: ${newLevel}, Limit: ${this.config.requestsPerSecond} req/s`);
        }
    }

    // Get auto-scale status
    getAutoScaleStatus(): { enabled: boolean; level: string; multiplier: number; avgTraffic: number } {
        const avgTraffic = this.trafficHistory.length > 0
            ? this.trafficHistory.reduce((a, b) => a + b, 0) / this.trafficHistory.length
            : 0;

        const multipliers: Record<string, number> = {
            normal: 1.5,
            elevated: 0.75,
            high: 0.5,
            extreme: 0.25,
        };

        return {
            enabled: this.autoScaleEnabled,
            level: this.currentScaleLevel,
            multiplier: multipliers[this.currentScaleLevel],
            avgTraffic: Math.round(avgTraffic),
        };
    }

    // Enable/disable auto-scaling
    setAutoScale(enabled: boolean): void {
        this.autoScaleEnabled = enabled;
        if (!enabled) {
            // Reset to base config
            this.config = { ...this.baseConfig };
            this.currentScaleLevel = 'normal';
        }
    }

    // Track request from IP
    trackRequest(ip: string): 'allow' | 'challenge' | 'block' {
        const now = Date.now();
        this.globalStats.totalRequests++;

        // Get or create tracker
        let tracker = this.ipTrackers.get(ip);
        if (!tracker) {
            tracker = { requests: [], blocked: false, challenged: false };
            this.ipTrackers.set(ip, tracker);
        }

        // Check if blocked
        if (tracker.blocked && tracker.blockedUntil && tracker.blockedUntil > now) {
            this.globalStats.blockedRequests++;
            return 'block';
        } else if (tracker.blocked) {
            // Unblock expired
            tracker.blocked = false;
            tracker.blockedUntil = undefined;
        }

        // Add request timestamp (sliding window)
        tracker.requests.push(now);

        // Keep only last second of requests
        const oneSecondAgo = now - 1000;
        tracker.requests = tracker.requests.filter(t => t > oneSecondAgo);

        const requestCount = tracker.requests.length;

        // Check rate limit
        if (requestCount > this.config.burstSize) {
            // Block IP
            tracker.blocked = true;
            tracker.blockedUntil = now + (this.config.blockDuration * 1000);
            this.globalStats.blockedRequests++;
            return 'block';
        }

        // Check challenge threshold
        if (this.mitigationMode !== 'off' && requestCount > this.config.challengeThreshold) {
            if (this.mitigationMode === 'block') {
                tracker.blocked = true;
                tracker.blockedUntil = now + (this.config.blockDuration * 1000);
                this.globalStats.blockedRequests++;
                return 'block';
            }
            tracker.challenged = true;
            this.globalStats.challengedRequests++;
            return 'challenge';
        }

        return 'allow';
    }

    // Get current stats
    getStats(): DDoSStats {
        const now = Date.now();
        const oneSecondAgo = now - 1000;

        let activeBlocks = 0;
        let requestsPerSecond = 0;
        const attackerMap: Map<string, number> = new Map();

        this.ipTrackers.forEach((tracker, ip) => {
            if (tracker.blocked && tracker.blockedUntil && tracker.blockedUntil > now) {
                activeBlocks++;
            }
            const recentRequests = tracker.requests.filter(t => t > oneSecondAgo).length;
            if (recentRequests > 0) {
                requestsPerSecond += recentRequests;
                attackerMap.set(ip, recentRequests);
            }
        });

        // Get top attackers
        const topAttackers = Array.from(attackerMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ip, requests]) => ({ ip, requests }));

        // Determine if under attack
        const isUnderAttack = requestsPerSecond > this.config.requestsPerSecond * 0.8 || activeBlocks > 5;

        return {
            totalRequests: this.globalStats.totalRequests,
            blockedRequests: this.globalStats.blockedRequests,
            challengedRequests: this.globalStats.challengedRequests,
            activeBlocks,
            topAttackers,
            requestsPerSecond,
            isUnderAttack,
            mitigationMode: this.mitigationMode,
        };
    }

    // Update configuration
    updateConfig(config: Partial<RateLimitConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // Set mitigation mode
    setMitigationMode(mode: 'off' | 'auto' | 'challenge' | 'block'): void {
        this.mitigationMode = mode;
    }

    // Get current config
    getConfig(): RateLimitConfig & { mitigationMode: string } {
        return { ...this.config, mitigationMode: this.mitigationMode };
    }

    // Block specific IP
    blockIP(ip: string, duration?: number): void {
        const tracker = this.ipTrackers.get(ip) || { requests: [], blocked: false, challenged: false };
        tracker.blocked = true;
        tracker.blockedUntil = Date.now() + ((duration || this.config.blockDuration) * 1000);
        this.ipTrackers.set(ip, tracker);
    }

    // Unblock IP
    unblockIP(ip: string): void {
        const tracker = this.ipTrackers.get(ip);
        if (tracker) {
            tracker.blocked = false;
            tracker.blockedUntil = undefined;
        }
    }

    // Get blocked IPs
    getBlockedIPs(): { ip: string; blockedUntil: number }[] {
        const now = Date.now();
        const blocked: { ip: string; blockedUntil: number }[] = [];

        this.ipTrackers.forEach((tracker, ip) => {
            if (tracker.blocked && tracker.blockedUntil && tracker.blockedUntil > now) {
                blocked.push({ ip, blockedUntil: tracker.blockedUntil });
            }
        });

        return blocked;
    }

    // Cleanup old entries
    private cleanup(): void {
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;

        this.ipTrackers.forEach((tracker, ip) => {
            // Remove entries with no recent requests and not blocked
            if (tracker.requests.length === 0 || tracker.requests[tracker.requests.length - 1] < fiveMinutesAgo) {
                if (!tracker.blocked || (tracker.blockedUntil && tracker.blockedUntil < now)) {
                    this.ipTrackers.delete(ip);
                }
            }
        });
    }

    // Stop service
    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// Singleton instance
export const ddosMitigation = new DDoSMitigationService();
