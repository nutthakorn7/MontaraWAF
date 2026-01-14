// Auto-tuning Rules Service
// Automatically adjusts WAF rules based on false positive detection and traffic patterns

interface RulePerformance {
    ruleId: string;
    ruleName: string;
    triggers: number;
    falsePositives: number;
    truePositives: number;
    accuracy: number;
    lastTriggered: string;
    recommendation: 'keep' | 'disable' | 'adjust_threshold' | 'review';
}

interface FalsePositiveReport {
    id: string;
    ruleId: string;
    ip: string;
    path: string;
    userAgent: string;
    timestamp: string;
    verified: boolean;
    reason?: string;
}

interface TuningAction {
    id: string;
    ruleId: string;
    action: 'adjusted' | 'disabled' | 'enabled' | 'threshold_changed';
    previousValue: any;
    newValue: any;
    reason: string;
    timestamp: string;
    reverted: boolean;
}

interface RuleThreshold {
    ruleId: string;
    sensitivity: 'low' | 'medium' | 'high';
    anomalyScore: number;
    maxFalsePositiveRate: number;
}

export class AutoTuningService {
    private rulePerformance: Map<string, RulePerformance> = new Map();
    private falsePositiveReports: FalsePositiveReport[] = [];
    private tuningHistory: TuningAction[] = [];
    private ruleThresholds: Map<string, RuleThreshold> = new Map();
    private autoTuneEnabled: boolean = true;
    private tuneInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Initialize with default rules
        this.initializeDefaultRules();

        // Run auto-tune every hour
        this.tuneInterval = setInterval(() => this.runAutoTune(), 3600000);
    }

    private initializeDefaultRules(): void {
        const defaultRules = [
            { id: 'sql-injection', name: 'SQL Injection Detection' },
            { id: 'xss-attack', name: 'XSS Attack Detection' },
            { id: 'path-traversal', name: 'Path Traversal Detection' },
            { id: 'command-injection', name: 'Command Injection Detection' },
            { id: 'rate-limit', name: 'Rate Limiting' },
            { id: 'bot-detection', name: 'Bot Detection' },
            { id: 'scanner-detection', name: 'Scanner Detection' },
        ];

        for (const rule of defaultRules) {
            this.rulePerformance.set(rule.id, {
                ruleId: rule.id,
                ruleName: rule.name,
                triggers: 0,
                falsePositives: 0,
                truePositives: 0,
                accuracy: 100,
                lastTriggered: '',
                recommendation: 'keep',
            });

            this.ruleThresholds.set(rule.id, {
                ruleId: rule.id,
                sensitivity: 'medium',
                anomalyScore: 50,
                maxFalsePositiveRate: 5,
            });
        }
    }

    // Record a rule trigger
    recordTrigger(ruleId: string, isBlocked: boolean): void {
        const perf = this.rulePerformance.get(ruleId);
        if (perf) {
            perf.triggers++;
            perf.lastTriggered = new Date().toISOString();
            if (isBlocked) perf.truePositives++;
            this.updateAccuracy(ruleId);
        }
    }

    // Report false positive
    reportFalsePositive(
        ruleId: string,
        ip: string,
        path: string,
        userAgent: string,
        reason?: string
    ): string {
        const report: FalsePositiveReport = {
            id: `fp-${Date.now()}`,
            ruleId,
            ip,
            path,
            userAgent,
            timestamp: new Date().toISOString(),
            verified: false,
            reason,
        };

        this.falsePositiveReports.push(report);

        const perf = this.rulePerformance.get(ruleId);
        if (perf) {
            perf.falsePositives++;
            this.updateAccuracy(ruleId);
        }

        // Keep only last 1000 reports
        if (this.falsePositiveReports.length > 1000) {
            this.falsePositiveReports = this.falsePositiveReports.slice(-500);
        }

        // Check if auto-tune should trigger
        if (this.autoTuneEnabled) {
            this.checkAutoTune(ruleId);
        }

        return report.id;
    }

    // Verify false positive report
    verifyFalsePositive(reportId: string, isVerified: boolean): boolean {
        const report = this.falsePositiveReports.find(r => r.id === reportId);
        if (report) {
            report.verified = isVerified;
            if (!isVerified) {
                // If not a real FP, decrement FP count
                const perf = this.rulePerformance.get(report.ruleId);
                if (perf && perf.falsePositives > 0) {
                    perf.falsePositives--;
                    perf.truePositives++;
                    this.updateAccuracy(report.ruleId);
                }
            }
            return true;
        }
        return false;
    }

    private updateAccuracy(ruleId: string): void {
        const perf = this.rulePerformance.get(ruleId);
        if (perf && perf.triggers > 0) {
            perf.accuracy = Math.round(((perf.triggers - perf.falsePositives) / perf.triggers) * 100);
            perf.recommendation = this.getRecommendation(perf);
        }
    }

    private getRecommendation(perf: RulePerformance): 'keep' | 'disable' | 'adjust_threshold' | 'review' {
        const fpRate = perf.triggers > 0 ? (perf.falsePositives / perf.triggers) * 100 : 0;

        if (fpRate > 30) return 'disable';
        if (fpRate > 15) return 'adjust_threshold';
        if (fpRate > 5) return 'review';
        return 'keep';
    }

    // Check if auto-tune should trigger for a rule
    private checkAutoTune(ruleId: string): void {
        const perf = this.rulePerformance.get(ruleId);
        const threshold = this.ruleThresholds.get(ruleId);

        if (!perf || !threshold) return;

        const fpRate = perf.triggers > 0 ? (perf.falsePositives / perf.triggers) * 100 : 0;

        if (fpRate > threshold.maxFalsePositiveRate && perf.triggers >= 10) {
            this.adjustRuleThreshold(ruleId, 'increase_tolerance');
        }
    }

    // Adjust rule threshold
    adjustRuleThreshold(ruleId: string, action: 'increase_tolerance' | 'decrease_tolerance'): void {
        const threshold = this.ruleThresholds.get(ruleId);
        if (!threshold) return;

        const previousValue = { ...threshold };

        if (action === 'increase_tolerance') {
            // Make rule less sensitive
            if (threshold.sensitivity === 'high') threshold.sensitivity = 'medium';
            else if (threshold.sensitivity === 'medium') threshold.sensitivity = 'low';
            threshold.anomalyScore += 10;
            threshold.maxFalsePositiveRate += 2;
        } else {
            // Make rule more sensitive
            if (threshold.sensitivity === 'low') threshold.sensitivity = 'medium';
            else if (threshold.sensitivity === 'medium') threshold.sensitivity = 'high';
            threshold.anomalyScore = Math.max(20, threshold.anomalyScore - 10);
            threshold.maxFalsePositiveRate = Math.max(1, threshold.maxFalsePositiveRate - 1);
        }

        const tuningAction: TuningAction = {
            id: `tune-${Date.now()}`,
            ruleId,
            action: 'threshold_changed',
            previousValue,
            newValue: { ...threshold },
            reason: action === 'increase_tolerance'
                ? 'High false positive rate detected'
                : 'Low detection rate, increasing sensitivity',
            timestamp: new Date().toISOString(),
            reverted: false,
        };

        this.tuningHistory.push(tuningAction);
        console.log(`[AutoTune] Rule ${ruleId}: ${action}`);
    }

    // Run full auto-tune analysis
    runAutoTune(): { tuned: number; recommendations: RulePerformance[] } {
        let tuned = 0;
        const recommendations: RulePerformance[] = [];

        for (const perf of this.rulePerformance.values()) {
            if (perf.recommendation !== 'keep' && perf.triggers >= 10) {
                recommendations.push(perf);

                if (perf.recommendation === 'adjust_threshold') {
                    this.adjustRuleThreshold(perf.ruleId, 'increase_tolerance');
                    tuned++;
                }
            }
        }

        return { tuned, recommendations };
    }

    // Get rule performance stats
    getRulePerformance(): RulePerformance[] {
        return Array.from(this.rulePerformance.values());
    }

    // Get tuning history
    getTuningHistory(limit: number = 20): TuningAction[] {
        return this.tuningHistory.slice(-limit).reverse();
    }

    // Get false positive reports
    getFalsePositiveReports(ruleId?: string): FalsePositiveReport[] {
        if (ruleId) {
            return this.falsePositiveReports.filter(r => r.ruleId === ruleId);
        }
        return this.falsePositiveReports.slice(-50);
    }

    // Revert a tuning action
    revertAction(actionId: string): boolean {
        const action = this.tuningHistory.find(a => a.id === actionId);
        if (action && !action.reverted) {
            const threshold = this.ruleThresholds.get(action.ruleId);
            if (threshold) {
                Object.assign(threshold, action.previousValue);
                action.reverted = true;
                return true;
            }
        }
        return false;
    }

    // Enable/disable auto-tuning
    setAutoTune(enabled: boolean): void {
        this.autoTuneEnabled = enabled;
    }

    // Get stats
    getStats(): {
        totalRules: number;
        tuningActionsToday: number;
        falsePositivesToday: number;
        rulesNeedingReview: number;
        overallAccuracy: number;
        autoTuneEnabled: boolean;
    } {
        const today = new Date().toISOString().split('T')[0];
        const tuningActionsToday = this.tuningHistory.filter(a => a.timestamp.startsWith(today)).length;
        const falsePositivesToday = this.falsePositiveReports.filter(r => r.timestamp.startsWith(today)).length;
        const rulesNeedingReview = Array.from(this.rulePerformance.values()).filter(r => r.recommendation !== 'keep').length;

        const accuracies = Array.from(this.rulePerformance.values()).map(r => r.accuracy);
        const overallAccuracy = accuracies.length > 0
            ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
            : 100;

        return {
            totalRules: this.rulePerformance.size,
            tuningActionsToday,
            falsePositivesToday,
            rulesNeedingReview,
            overallAccuracy,
            autoTuneEnabled: this.autoTuneEnabled,
        };
    }

    // Cleanup
    stop(): void {
        if (this.tuneInterval) {
            clearInterval(this.tuneInterval);
        }
    }
}

export const autoTuning = new AutoTuningService();
