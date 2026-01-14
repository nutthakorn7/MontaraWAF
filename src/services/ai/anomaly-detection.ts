// AI Anomaly Detection Service
// Uses statistical methods and Isolation Forest-like approach for detecting anomalies

interface RequestFeatures {
    ip: string;
    path: string;
    method: string;
    userAgent: string;
    timestamp: number;
    requestSize: number;
    responseTime: number;
    statusCode: number;
    headers: Record<string, string>;
}

interface AnomalyScore {
    ip: string;
    score: number; // 0-100, higher = more anomalous
    features: {
        requestRate: number;
        pathEntropy: number;
        timingVariance: number;
        methodDistribution: number;
        sizeAnomaly: number;
        geoAnomaly: number;
    };
    isAnomaly: boolean;
    reasons: string[];
}

interface TrafficProfile {
    avgRequestsPerMinute: number;
    avgResponseTime: number;
    avgRequestSize: number;
    commonPaths: Map<string, number>;
    commonMethods: Map<string, number>;
    peakHours: number[];
}

export class AnomalyDetectionService {
    private requestHistory: RequestFeatures[] = [];
    private ipProfiles: Map<string, RequestFeatures[]> = new Map();
    private globalProfile: TrafficProfile;
    private anomalyThreshold: number = 70;
    private detectedAnomalies: AnomalyScore[] = [];

    constructor() {
        this.globalProfile = {
            avgRequestsPerMinute: 10,
            avgResponseTime: 200,
            avgRequestSize: 1024,
            commonPaths: new Map(),
            commonMethods: new Map([['GET', 60], ['POST', 30], ['PUT', 5], ['DELETE', 5]]),
            peakHours: [9, 10, 11, 14, 15, 16],
        };

        // Cleanup old data every 5 minutes
        setInterval(() => this.cleanup(), 300000);
    }

    // Record request for analysis
    recordRequest(req: RequestFeatures): void {
        this.requestHistory.push(req);

        // Update IP profile
        const ipHistory = this.ipProfiles.get(req.ip) || [];
        ipHistory.push(req);
        this.ipProfiles.set(req.ip, ipHistory);

        // Update global profile
        this.updateGlobalProfile(req);

        // Keep only last 10000 requests
        if (this.requestHistory.length > 10000) {
            this.requestHistory = this.requestHistory.slice(-5000);
        }
    }

    private updateGlobalProfile(req: RequestFeatures): void {
        const pathCount = this.globalProfile.commonPaths.get(req.path) || 0;
        this.globalProfile.commonPaths.set(req.path, pathCount + 1);

        const methodCount = this.globalProfile.commonMethods.get(req.method) || 0;
        this.globalProfile.commonMethods.set(req.method, methodCount + 1);
    }

    // Analyze IP for anomalies
    analyzeIP(ip: string): AnomalyScore {
        const history = this.ipProfiles.get(ip) || [];
        const reasons: string[] = [];
        let totalScore = 0;

        // Feature 1: Request Rate
        const requestRate = this.calculateRequestRate(history);
        const rateScore = Math.min(100, (requestRate / this.globalProfile.avgRequestsPerMinute) * 20);
        if (rateScore > 50) reasons.push(`High request rate: ${requestRate.toFixed(1)}/min`);
        totalScore += rateScore * 0.25;

        // Feature 2: Path Entropy (randomness of accessed paths)
        const pathEntropy = this.calculatePathEntropy(history);
        const entropyScore = pathEntropy > 0.8 ? 80 : pathEntropy * 100;
        if (entropyScore > 60) reasons.push(`High path randomness: ${(pathEntropy * 100).toFixed(0)}%`);
        totalScore += entropyScore * 0.2;

        // Feature 3: Timing Variance (too consistent = bot)
        const timingVariance = this.calculateTimingVariance(history);
        const timingScore = timingVariance < 50 ? 80 : Math.max(0, 100 - timingVariance);
        if (timingScore > 60) reasons.push('Suspiciously consistent timing');
        totalScore += timingScore * 0.15;

        // Feature 4: Method Distribution
        const methodScore = this.calculateMethodAnomaly(history);
        if (methodScore > 50) reasons.push('Unusual HTTP method usage');
        totalScore += methodScore * 0.15;

        // Feature 5: Size Anomaly
        const sizeAnomaly = this.calculateSizeAnomaly(history);
        if (sizeAnomaly > 50) reasons.push('Abnormal request sizes');
        totalScore += sizeAnomaly * 0.15;

        // Feature 6: Time of Day Anomaly
        const geoAnomaly = this.calculateTimeAnomaly(history);
        if (geoAnomaly > 50) reasons.push('Unusual access times');
        totalScore += geoAnomaly * 0.1;

        const score: AnomalyScore = {
            ip,
            score: Math.round(totalScore),
            features: {
                requestRate: rateScore,
                pathEntropy: entropyScore,
                timingVariance: timingScore,
                methodDistribution: methodScore,
                sizeAnomaly,
                geoAnomaly,
            },
            isAnomaly: totalScore >= this.anomalyThreshold,
            reasons,
        };

        if (score.isAnomaly) {
            this.detectedAnomalies.push(score);
            if (this.detectedAnomalies.length > 1000) {
                this.detectedAnomalies = this.detectedAnomalies.slice(-500);
            }
        }

        return score;
    }

    private calculateRequestRate(history: RequestFeatures[]): number {
        if (history.length < 2) return 0;
        const timeSpan = (history[history.length - 1].timestamp - history[0].timestamp) / 60000;
        return timeSpan > 0 ? history.length / timeSpan : history.length;
    }

    private calculatePathEntropy(history: RequestFeatures[]): number {
        const pathCounts = new Map<string, number>();
        for (const req of history) {
            const count = pathCounts.get(req.path) || 0;
            pathCounts.set(req.path, count + 1);
        }

        const total = history.length;
        let entropy = 0;
        for (const count of pathCounts.values()) {
            const p = count / total;
            entropy -= p * Math.log2(p);
        }

        // Normalize to 0-1
        const maxEntropy = Math.log2(pathCounts.size);
        return maxEntropy > 0 ? entropy / maxEntropy : 0;
    }

    private calculateTimingVariance(history: RequestFeatures[]): number {
        if (history.length < 3) return 100;

        const intervals: number[] = [];
        for (let i = 1; i < history.length; i++) {
            intervals.push(history[i].timestamp - history[i - 1].timestamp);
        }

        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;

        return Math.sqrt(variance);
    }

    private calculateMethodAnomaly(history: RequestFeatures[]): number {
        const methodCounts = new Map<string, number>();
        for (const req of history) {
            const count = methodCounts.get(req.method) || 0;
            methodCounts.set(req.method, count + 1);
        }

        // Check if using unusual methods heavily
        const total = history.length;
        const getPercent = (methodCounts.get('GET') || 0) / total * 100;

        // Normal is mostly GET requests
        if (getPercent < 30) return 80;
        if (getPercent < 50) return 50;
        return 20;
    }

    private calculateSizeAnomaly(history: RequestFeatures[]): number {
        const sizes = history.map(h => h.requestSize);
        const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;

        // Very large or very small requests are suspicious
        if (avgSize > 10000) return 70;
        if (avgSize < 100) return 50;
        return 20;
    }

    private calculateTimeAnomaly(history: RequestFeatures[]): number {
        const hours = history.map(h => new Date(h.timestamp).getHours());
        const nightHours = hours.filter(h => h >= 0 && h <= 6).length;
        const nightPercent = (nightHours / hours.length) * 100;

        // High activity at night is suspicious
        if (nightPercent > 50) return 70;
        if (nightPercent > 30) return 50;
        return 20;
    }

    // Get recent anomalies
    getRecentAnomalies(limit: number = 20): AnomalyScore[] {
        return this.detectedAnomalies.slice(-limit).reverse();
    }

    // Get stats
    getStats(): {
        totalRequests: number;
        uniqueIPs: number;
        anomaliesDetected: number;
        anomalyRate: number;
        topAnomalousIPs: { ip: string; score: number }[];
    } {
        const anomalyRate = this.requestHistory.length > 0
            ? (this.detectedAnomalies.length / this.requestHistory.length) * 100
            : 0;

        const topIPs = Array.from(this.ipProfiles.keys())
            .map(ip => ({ ip, score: this.analyzeIP(ip).score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return {
            totalRequests: this.requestHistory.length,
            uniqueIPs: this.ipProfiles.size,
            anomaliesDetected: this.detectedAnomalies.length,
            anomalyRate: Math.round(anomalyRate * 100) / 100,
            topAnomalousIPs: topIPs,
        };
    }

    // Set threshold
    setThreshold(threshold: number): void {
        this.anomalyThreshold = Math.max(0, Math.min(100, threshold));
    }

    // Cleanup old data
    private cleanup(): void {
        const fiveMinutesAgo = Date.now() - 300000;

        this.requestHistory = this.requestHistory.filter(r => r.timestamp > fiveMinutesAgo);

        for (const [ip, history] of this.ipProfiles) {
            const filtered = history.filter(r => r.timestamp > fiveMinutesAgo);
            if (filtered.length === 0) {
                this.ipProfiles.delete(ip);
            } else {
                this.ipProfiles.set(ip, filtered);
            }
        }
    }
}

export const anomalyDetection = new AnomalyDetectionService();
