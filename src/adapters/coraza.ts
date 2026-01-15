// Coraza Adapter - Parses Coraza WAF logs

import { SecurityStats, WAFStats } from './aggregator';
import * as fs from 'fs';
import * as readline from 'readline';

export class CorazaAdapter {
    private logPath: string;

    constructor(logPath: string) {
        this.logPath = logPath;
    }

    async getSecurityStats(timeRange: string): Promise<SecurityStats> {
        const events = await this.parseAuditLog(timeRange);

        const attackTypes: Record<string, number> = {};
        for (const event of events) {
            for (const tag of event.tags || []) {
                if (tag.startsWith('attack-')) {
                    attackTypes[tag] = (attackTypes[tag] || 0) + 1;
                }
            }
        }

        return {
            threatsBlocked: events.length,
            attackTypes: Object.entries(attackTypes).map(([type, count]) => ({ type, count })),
            topAttackers: [],
            source: 'coraza',
        };
    }

    async getWAFStats(timeRange: string): Promise<WAFStats> {
        const events = await this.parseAuditLog(timeRange);

        const ruleCategories: Record<string, number> = {};
        const ruleCount: Record<string, { name: string; count: number }> = {};

        for (const event of events) {
            // Extract rule category from rule ID (e.g., 942 = SQLi)
            if (event.ruleId) {
                const category = this.getRuleCategory(event.ruleId);
                ruleCategories[category] = (ruleCategories[category] || 0) + 1;

                const ruleKey = event.ruleId.toString();
                if (!ruleCount[ruleKey]) {
                    ruleCount[ruleKey] = { name: event.message || 'Unknown', count: 0 };
                }
                ruleCount[ruleKey].count++;
            }
        }

        const topRules = Object.entries(ruleCount)
            .map(([ruleId, data]) => ({ ruleId, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            events: events.length,
            blocked: events.filter(e => e.action === 'block').length,
            ruleCategories: Object.entries(ruleCategories).map(([category, count]) => ({ category, count })),
            topRules,
            source: 'coraza',
        };
    }

    private getRuleCategory(ruleId: number): string {
        const categoryMap: Record<number, string> = {
            9: 'Initialization',
            91: 'Method Enforcement',
            92: 'Protocol Enforcement',
            93: 'LFI/RFI/RCE',
            94: 'XSS/SQLi',
            95: 'Data Leakage',
        };

        const prefix = Math.floor(ruleId / 10000);
        return categoryMap[prefix] || 'Other';
    }

    private async parseAuditLog(timeRange: string): Promise<WAFEvent[]> {
        const events: WAFEvent[] = [];
        const hours = parseInt(timeRange.replace('h', '')) || 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        try {
            const fileStream = fs.createReadStream(this.logPath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            let currentEvent: Partial<WAFEvent> = {};

            for await (const line of rl) {
                if (line.startsWith('--')) {
                    if (currentEvent.timestamp && new Date(currentEvent.timestamp) > since) {
                        events.push(currentEvent as WAFEvent);
                    }
                    currentEvent = {};
                    continue;
                }

                // Parse audit log parts
                if (line.startsWith('[')) {
                    const match = line.match(/\[(\d{2}\/\w+\/\d{4}:\d{2}:\d{2}:\d{2})/);
                    if (match) {
                        currentEvent.timestamp = new Date(match[1].replace(/\//g, ' ').replace(':', ' ')).toISOString();
                    }
                }

                if (line.includes('Message:')) {
                    currentEvent.message = line.split('Message:')[1]?.trim();
                }

                if (line.includes('[id "')) {
                    const idMatch = line.match(/\[id "(\d+)"/);
                    if (idMatch) currentEvent.ruleId = parseInt(idMatch[1]);
                }

                if (line.includes('[tag "')) {
                    const tags = line.match(/\[tag "([^"]+)"/g);
                    if (tags) {
                        currentEvent.tags = tags.map(t => t.match(/\[tag "([^"]+)"/)?.[1] || '');
                    }
                }

                if (line.includes('Action:')) {
                    currentEvent.action = line.includes('block') ? 'block' : 'log';
                }
            }

            // Don't forget last event
            if (currentEvent.timestamp && new Date(currentEvent.timestamp) > since) {
                events.push(currentEvent as WAFEvent);
            }
        } catch (error) {
            console.error('Error parsing Coraza audit log:', error);
        }

        return events;
    }
}

interface WAFEvent {
    timestamp: string;
    ruleId?: number;
    message?: string;
    tags?: string[];
    action?: string;
    clientIp?: string;
}
