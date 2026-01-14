// CrowdSec Adapter - Fetches data from CrowdSec API

import { SecurityStats, DDoSStats, BotStats } from '../index';

export class CrowdSecAdapter {
    private apiUrl: string;
    private apiKey: string;

    constructor(apiUrl: string, apiKey: string) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    private async fetch(endpoint: string): Promise<any> {
        const res = await fetch(`${this.apiUrl}${endpoint}`, {
            headers: {
                'X-Api-Key': this.apiKey,
            },
        });
        if (!res.ok) throw new Error(`CrowdSec API error: ${res.status}`);
        return res.json();
    }

    async getSecurityStats(timeRange: string): Promise<SecurityStats> {
        const alerts = await this.fetch('/v1/alerts?since=' + this.getTimestamp(timeRange));

        const attackTypes: Record<string, number> = {};
        const attackerMap: Record<string, { country: string; attacks: number }> = {};

        for (const alert of alerts) {
            const scenario = alert.scenario || 'unknown';
            attackTypes[scenario] = (attackTypes[scenario] || 0) + 1;

            if (alert.source?.ip) {
                if (!attackerMap[alert.source.ip]) {
                    attackerMap[alert.source.ip] = { country: alert.source.cn || 'Unknown', attacks: 0 };
                }
                attackerMap[alert.source.ip].attacks++;
            }
        }

        const topAttackers = Object.entries(attackerMap)
            .map(([ip, data]) => ({ ip, ...data }))
            .sort((a, b) => b.attacks - a.attacks)
            .slice(0, 10);

        return {
            threatsBlocked: alerts.length,
            attackTypes: Object.entries(attackTypes).map(([type, count]) => ({ type, count })),
            topAttackers,
            source: 'crowdsec',
        };
    }

    async getDDoSStats(timeRange: string): Promise<DDoSStats> {
        const alerts = await this.fetch('/v1/alerts?since=' + this.getTimestamp(timeRange));

        const ddosAlerts = alerts.filter((a: any) =>
            a.scenario?.includes('ddos') || a.scenario?.includes('flood')
        );

        const attackTypes: Record<string, number> = {};
        for (const alert of ddosAlerts) {
            const type = alert.scenario || 'unknown';
            attackTypes[type] = (attackTypes[type] || 0) + 1;
        }

        return {
            attacks: ddosAlerts.length,
            mitigated: ddosAlerts.length,
            attackTypes: Object.entries(attackTypes).map(([type, count]) => ({ type, count })),
            source: 'crowdsec',
        };
    }

    async getBotStats(timeRange: string): Promise<BotStats> {
        const alerts = await this.fetch('/v1/alerts?since=' + this.getTimestamp(timeRange));

        const botAlerts = alerts.filter((a: any) =>
            a.scenario?.includes('bot') || a.scenario?.includes('crawler') || a.scenario?.includes('scanner')
        );

        const decisions = await this.getDecisions();
        const captchaDecisions = decisions.filter((d: any) => d.type === 'captcha');

        const botTypes: Record<string, number> = {};
        for (const alert of botAlerts) {
            const type = alert.scenario || 'unknown';
            botTypes[type] = (botTypes[type] || 0) + 1;
        }

        return {
            detected: botAlerts.length,
            blocked: decisions.filter((d: any) => d.type === 'ban').length,
            challenged: captchaDecisions.length,
            botTypes: Object.entries(botTypes).map(([type, count]) => ({ type, count })),
            source: 'crowdsec',
        };
    }

    async getDecisions(): Promise<any[]> {
        return this.fetch('/v1/decisions');
    }

    async addDecision(ip: string, type: string, duration: string): Promise<void> {
        await fetch(`${this.apiUrl}/v1/decisions`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
                duration,
                origin: 'montara-dashboard',
                scenario: 'manual',
                scope: 'ip',
                type,
                value: ip,
            }]),
        });
    }

    async removeDecision(ip: string): Promise<void> {
        await fetch(`${this.apiUrl}/v1/decisions?ip=${ip}`, {
            method: 'DELETE',
            headers: {
                'X-Api-Key': this.apiKey,
            },
        });
    }

    private getTimestamp(timeRange: string): string {
        const now = new Date();
        const hours = parseInt(timeRange.replace('h', '')) || 24;
        now.setHours(now.getHours() - hours);
        return now.toISOString();
    }
}
