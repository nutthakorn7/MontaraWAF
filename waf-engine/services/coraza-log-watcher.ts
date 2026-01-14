// Coraza Log Watcher Service
// Watches Coraza audit logs for real-time events

import * as fs from 'fs';

export interface CorazaLogEvent {
    id: string;
    timestamp: string;
    ruleId: string;
    ruleName: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    clientIp: string;
    method: string;
    uri: string;
    message: string;
    action: 'blocked' | 'logged';
}

export class CorazaLogWatcher {
    private logPath: string;
    private lastPosition: number = 0;
    private buffer: string = '';

    constructor(logPath: string) {
        this.logPath = logPath;
    }

    // Get new events since last check
    async getNewEvents(): Promise<CorazaLogEvent[]> {
        const events: CorazaLogEvent[] = [];

        try {
            // Check if file exists
            if (!fs.existsSync(this.logPath)) {
                return events;
            }

            const stats = fs.statSync(this.logPath);

            // If file was truncated, reset position
            if (stats.size < this.lastPosition) {
                this.lastPosition = 0;
                this.buffer = '';
            }

            // Read new content from last position
            if (stats.size > this.lastPosition) {
                const fd = fs.openSync(this.logPath, 'r');
                const newContent = Buffer.alloc(stats.size - this.lastPosition);
                fs.readSync(fd, newContent, 0, newContent.length, this.lastPosition);
                fs.closeSync(fd);

                this.buffer += newContent.toString('utf-8');
                this.lastPosition = stats.size;

                // Parse audit log entries
                const entries = this.parseAuditLog(this.buffer);
                events.push(...entries);

                // Keep any incomplete entry in buffer
                const lastSeparator = this.buffer.lastIndexOf('---');
                if (lastSeparator !== -1) {
                    this.buffer = this.buffer.slice(lastSeparator);
                }
            }
        } catch (error) {
            console.error('Coraza log watch error:', error);
        }

        return events;
    }

    private parseAuditLog(content: string): CorazaLogEvent[] {
        const events: CorazaLogEvent[] = [];
        const entries = content.split(/---[a-f0-9]+-[A-Z]---/);

        for (const entry of entries) {
            if (!entry.trim()) continue;

            const event = this.parseEntry(entry);
            if (event) {
                events.push(event);
            }
        }

        return events;
    }

    private parseEntry(entry: string): CorazaLogEvent | null {
        try {
            // Extract timestamp
            const timestampMatch = entry.match(/\[(\d{2}\/\w+\/\d{4}:\d{2}:\d{2}:\d{2}[^\]]*)\]/);
            const timestamp = timestampMatch
                ? this.parseTimestamp(timestampMatch[1])
                : new Date().toISOString();

            // Extract rule ID
            const ruleIdMatch = entry.match(/\[id "(\d+)"\]/);
            const ruleId = ruleIdMatch ? ruleIdMatch[1] : 'unknown';

            // Extract message
            const msgMatch = entry.match(/\[msg "([^"]+)"\]/);
            const message = msgMatch ? msgMatch[1] : 'Unknown rule triggered';

            // Extract severity
            const severityMatch = entry.match(/\[severity "([^"]+)"\]/);
            const severity = this.mapSeverity(severityMatch?.[1]);

            // Extract client IP
            const ipMatch = entry.match(/\[client "?(\d+\.\d+\.\d+\.\d+)"?\]/);
            const clientIp = ipMatch ? ipMatch[1] : 'unknown';

            // Extract request line
            const requestMatch = entry.match(/([A-Z]+) ([^\s]+) HTTP/);
            const method = requestMatch ? requestMatch[1] : 'GET';
            const uri = requestMatch ? requestMatch[2] : '/';

            // Determine category from rule ID
            const category = this.getCategoryFromRuleId(ruleId);

            // Check if blocked
            const isBlocked = entry.includes('status 403') || entry.includes('Action: Intercepted');

            return {
                id: `coraza-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp,
                ruleId,
                ruleName: message,
                category,
                severity,
                clientIp,
                method,
                uri,
                message,
                action: isBlocked ? 'blocked' : 'logged',
            };
        } catch (error) {
            console.error('Parse entry error:', error);
            return null;
        }
    }

    private parseTimestamp(ts: string): string {
        try {
            // Format: 14/Jan/2026:22:50:00 +0000
            const parts = ts.match(/(\d{2})\/(\w+)\/(\d{4}):(\d{2}):(\d{2}):(\d{2})/);
            if (parts) {
                const months: Record<string, string> = {
                    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
                };
                const [, day, month, year, hour, min, sec] = parts;
                return `${year}-${months[month]}-${day}T${hour}:${min}:${sec}Z`;
            }
        } catch { }
        return new Date().toISOString();
    }

    private mapSeverity(severity?: string): CorazaLogEvent['severity'] {
        if (!severity) return 'medium';
        const upper = severity.toUpperCase();
        if (upper === 'CRITICAL' || upper === 'EMERGENCY') return 'critical';
        if (upper === 'ERROR' || upper === 'WARNING') return 'high';
        if (upper === 'NOTICE') return 'medium';
        return 'low';
    }

    private getCategoryFromRuleId(ruleId: string): string {
        const id = parseInt(ruleId);
        if (id >= 941000 && id < 942000) return 'XSS';
        if (id >= 942000 && id < 943000) return 'SQLi';
        if (id >= 930000 && id < 931000) return 'LFI';
        if (id >= 931000 && id < 932000) return 'RFI';
        if (id >= 932000 && id < 933000) return 'RCE';
        if (id >= 913000 && id < 914000) return 'Scanner';
        if (id >= 920000 && id < 921000) return 'Protocol';
        if (id >= 950000 && id < 960000) return 'Data Leakage';
        return 'Security';
    }
}
