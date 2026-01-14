// AI Bot Classifier Service
// Uses ML-inspired approach with feature extraction and scoring for bot classification

interface BotFeatures {
    // Request patterns
    requestRate: number;
    burstiness: number;
    sessionDuration: number;

    // Navigation patterns
    pathDepth: number;
    pathRandomness: number;
    resourcesRequested: boolean;

    // Timing patterns
    avgIntervalMs: number;
    intervalVariance: number;
    humanLikePatterns: boolean;

    // Headers
    hasAcceptLanguage: boolean;
    hasReferer: boolean;
    hasCookies: boolean;
    headerCount: number;

    // User Agent
    uaComplexity: number;
    knownBot: boolean;

    // Behavior
    jsChallengeTime: number;
    mouseMovement: boolean;
    scrollBehavior: boolean;
}

interface BotClassification {
    ip: string;
    userAgent: string;
    classification: 'human' | 'good_bot' | 'bad_bot' | 'unknown';
    confidence: number; // 0-100
    features: Partial<BotFeatures>;
    reasons: string[];
    timestamp: string;
}

// Feature weights for classification (resembles ML model weights)
const FEATURE_WEIGHTS = {
    requestRate: -0.15,           // High rate = more likely bot
    burstiness: -0.1,             // Bursty = bot
    sessionDuration: 0.05,        // Longer = more likely human
    pathRandomness: -0.12,        // Random paths = bot
    resourcesRequested: 0.1,      // Requests CSS/JS = human
    intervalVariance: 0.15,       // Varied timing = human
    humanLikePatterns: 0.2,       // Human patterns = human
    hasAcceptLanguage: 0.08,      // Has headers = human
    hasReferer: 0.08,
    hasCookies: 0.1,
    headerCount: 0.05,
    uaComplexity: 0.08,
    knownBot: -0.3,               // Known bot UA = bot
    jsChallengeTime: 0.15,        // Pass challenge = human
    mouseMovement: 0.2,           // Mouse = human
    scrollBehavior: 0.15,         // Scroll = human
};

// Known good bot patterns
const GOOD_BOT_PATTERNS = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'applebot', 'pinterestbot',
];

export class BotClassifierService {
    private classificationHistory: Map<string, BotClassification[]> = new Map();
    private sessionData: Map<string, { features: Partial<BotFeatures>; requests: number[] }> = new Map();

    // Extract features from session data
    extractFeatures(
        ip: string,
        userAgent: string,
        headers: Record<string, string>,
        behaviorData?: { mouseMovement: boolean; scrollBehavior: boolean; jsChallengeTime: number }
    ): BotFeatures {
        const session = this.sessionData.get(ip) || { features: {}, requests: [] };
        const requests = session.requests;

        // Calculate request patterns
        const now = Date.now();
        requests.push(now);

        // Keep only last 5 minutes
        const fiveMinAgo = now - 300000;
        const recentRequests = requests.filter(r => r > fiveMinAgo);
        session.requests = recentRequests;
        this.sessionData.set(ip, session);

        const requestRate = recentRequests.length / 5; // per minute

        // Calculate burstiness (stddev of intervals)
        let burstiness = 0;
        let avgIntervalMs = 0;
        let intervalVariance = 100;

        if (recentRequests.length > 1) {
            const intervals: number[] = [];
            for (let i = 1; i < recentRequests.length; i++) {
                intervals.push(recentRequests[i] - recentRequests[i - 1]);
            }
            avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgIntervalMs, 2), 0) / intervals.length;
            intervalVariance = Math.sqrt(variance);
            burstiness = intervals.filter(i => i < 100).length / intervals.length * 100;
        }

        const features: BotFeatures = {
            requestRate,
            burstiness,
            sessionDuration: (recentRequests[recentRequests.length - 1] - recentRequests[0]) / 1000,
            pathDepth: 0,
            pathRandomness: 0,
            resourcesRequested: false,
            avgIntervalMs,
            intervalVariance,
            humanLikePatterns: intervalVariance > 500,
            hasAcceptLanguage: !!headers['accept-language'],
            hasReferer: !!headers['referer'],
            hasCookies: !!headers['cookie'],
            headerCount: Object.keys(headers).length,
            uaComplexity: userAgent.length > 50 ? userAgent.split(/[\/\(\)\s;,]/).length : 0,
            knownBot: GOOD_BOT_PATTERNS.some(p => userAgent.toLowerCase().includes(p)),
            jsChallengeTime: behaviorData?.jsChallengeTime || 0,
            mouseMovement: behaviorData?.mouseMovement || false,
            scrollBehavior: behaviorData?.scrollBehavior || false,
        };

        return features;
    }

    // Classify request as bot or human
    classify(
        ip: string,
        userAgent: string,
        headers: Record<string, string>,
        behaviorData?: { mouseMovement: boolean; scrollBehavior: boolean; jsChallengeTime: number }
    ): BotClassification {
        const features = this.extractFeatures(ip, userAgent, headers, behaviorData);
        const reasons: string[] = [];

        // Check for known good bots first
        if (features.knownBot) {
            return {
                ip,
                userAgent,
                classification: 'good_bot',
                confidence: 95,
                features,
                reasons: ['Verified search engine bot'],
                timestamp: new Date().toISOString(),
            };
        }

        // Calculate weighted score (positive = human, negative = bot)
        let score = 0;

        // Request rate scoring
        if (features.requestRate > 60) {
            score += FEATURE_WEIGHTS.requestRate * 3;
            reasons.push('Very high request rate');
        } else if (features.requestRate > 30) {
            score += FEATURE_WEIGHTS.requestRate * 2;
            reasons.push('High request rate');
        }

        // Burstiness scoring
        if (features.burstiness > 50) {
            score += FEATURE_WEIGHTS.burstiness * 2;
            reasons.push('Bursty request pattern');
        }

        // Timing variance (humans are less consistent)
        if (features.humanLikePatterns) {
            score += FEATURE_WEIGHTS.humanLikePatterns;
            reasons.push('Human-like timing patterns');
        } else if (features.intervalVariance < 100) {
            reasons.push('Very consistent timing (bot-like)');
        }

        // Header presence
        if (features.hasAcceptLanguage) score += FEATURE_WEIGHTS.hasAcceptLanguage;
        if (features.hasReferer) score += FEATURE_WEIGHTS.hasReferer;
        if (features.hasCookies) score += FEATURE_WEIGHTS.hasCookies;
        if (features.headerCount > 10) score += FEATURE_WEIGHTS.headerCount;

        // Behavior data (strongest signals)
        if (features.mouseMovement) {
            score += FEATURE_WEIGHTS.mouseMovement;
            reasons.push('Mouse movement detected');
        }
        if (features.scrollBehavior) {
            score += FEATURE_WEIGHTS.scrollBehavior;
            reasons.push('Scroll behavior detected');
        }
        if (features.jsChallengeTime > 500 && features.jsChallengeTime < 30000) {
            score += FEATURE_WEIGHTS.jsChallengeTime;
            reasons.push('Passed JS challenge naturally');
        }

        // UA complexity
        if (features.uaComplexity > 10) {
            score += FEATURE_WEIGHTS.uaComplexity;
        }

        // Normalize score to 0-100 confidence
        const normalizedScore = Math.max(-1, Math.min(1, score));
        const confidence = Math.round(Math.abs(normalizedScore) * 100);

        let classification: 'human' | 'bad_bot' | 'unknown';
        if (normalizedScore > 0.3) {
            classification = 'human';
        } else if (normalizedScore < -0.3) {
            classification = 'bad_bot';
        } else {
            classification = 'unknown';
        }

        const result: BotClassification = {
            ip,
            userAgent,
            classification,
            confidence,
            features,
            reasons,
            timestamp: new Date().toISOString(),
        };

        // Store classification
        const history = this.classificationHistory.get(ip) || [];
        history.push(result);
        if (history.length > 100) history.shift();
        this.classificationHistory.set(ip, history);

        return result;
    }

    // Get classification history for IP
    getHistory(ip: string): BotClassification[] {
        return this.classificationHistory.get(ip) || [];
    }

    // Get stats
    getStats(): {
        totalClassifications: number;
        humanCount: number;
        badBotCount: number;
        goodBotCount: number;
        unknownCount: number;
        recentClassifications: BotClassification[];
    } {
        let humanCount = 0, badBotCount = 0, goodBotCount = 0, unknownCount = 0;
        const recent: BotClassification[] = [];

        for (const history of this.classificationHistory.values()) {
            for (const c of history) {
                if (c.classification === 'human') humanCount++;
                else if (c.classification === 'bad_bot') badBotCount++;
                else if (c.classification === 'good_bot') goodBotCount++;
                else unknownCount++;
            }
            if (history.length > 0) {
                recent.push(history[history.length - 1]);
            }
        }

        return {
            totalClassifications: humanCount + badBotCount + goodBotCount + unknownCount,
            humanCount,
            badBotCount,
            goodBotCount,
            unknownCount,
            recentClassifications: recent.slice(-20).reverse(),
        };
    }

    // Train on feedback (simple online learning)
    provideFeedback(ip: string, correctClassification: 'human' | 'bad_bot' | 'good_bot'): void {
        // In a real ML system, this would update model weights
        console.log(`Feedback received for ${ip}: ${correctClassification}`);
        // Could store for retraining or adjust thresholds
    }
}

export const botClassifier = new BotClassifierService();
