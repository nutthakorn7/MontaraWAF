// APISIX Log Reader Service
// Reads WAF block events from APISIX access/error logs via Docker

interface WAFBlockEvent {
    id: string;
    timestamp: string;
    type: 'sqli' | 'xss' | 'rce' | 'lfi' | 'rfi' | 'traversal' | 'bot' | 'rate_limit' | 'crowdsec';
    severity: 'critical' | 'high' | 'medium' | 'low';
    clientIp: string;
    uri: string;
    rule: string;
    message: string;
    action: 'blocked' | 'logged';
}

export class APISIXLogReader {
    private lastEventId: number = 0;

    // Parse APISIX error log line for WAF blocks
    private parseLogLine(line: string): WAFBlockEvent | null {
        try {
            // Look for our WAF block patterns
            if (!line.includes('blocked by WAF') && !line.includes('403')) {
                return null;
            }

            // Extract client IP
            const ipMatch = line.match(/client: ([\d.]+)/);
            const clientIp = ipMatch ? ipMatch[1] : 'unknown';

            // Extract URI
            const uriMatch = line.match(/request: "[A-Z]+ ([^"]+)"/);
            const uri = uriMatch ? uriMatch[1] : '/';

            // Determine type from message
            let type: WAFBlockEvent['type'] = 'sqli';
            let rule = 'unknown';
            let message = 'Request blocked';

            if (line.includes('SQL Injection')) {
                type = 'sqli';
                rule = '942100';
                message = 'SQL Injection blocked by WAF';
            } else if (line.includes('XSS')) {
                type = 'xss';
                rule = '941100';
                message = 'XSS blocked by WAF';
            } else if (line.includes('Remote Code Execution') || line.includes('RCE')) {
                type = 'rce';
                rule = '932100';
                message = 'Remote Code Execution blocked by WAF';
            } else if (line.includes('Local File Inclusion') || line.includes('LFI')) {
                type = 'lfi';
                rule = '930110';
                message = 'Local File Inclusion blocked by WAF';
            } else if (line.includes('Remote File Inclusion') || line.includes('RFI')) {
                type = 'rfi';
                rule = '931100';
                message = 'Remote File Inclusion blocked by WAF';
            } else if (line.includes('Path Traversal')) {
                type = 'traversal';
                rule = '930100';
                message = 'Path Traversal blocked by WAF';
            } else if (line.includes('Bot blocked') || line.includes('ua-restriction')) {
                type = 'bot';
                rule = 'bot-001';
                message = 'Bot blocked by WAF';
            } else if (line.includes('Rate limit') || line.includes('limit-req')) {
                type = 'rate_limit';
                rule = 'rate-001';
                message = 'Rate limit exceeded';
            } else if (line.includes('CrowdSec') || line.includes('IP banned')) {
                type = 'crowdsec';
                rule = 'crowdsec-001';
                message = 'IP banned by CrowdSec';
            }

            // Extract timestamp
            const timestampMatch = line.match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/);
            const timestamp = timestampMatch
                ? new Date(timestampMatch[0].replace(/\//g, '-')).toISOString()
                : new Date().toISOString();

            return {
                id: `waf-${++this.lastEventId}-${Date.now()}`,
                timestamp,
                type,
                severity: this.getSeverity(type),
                clientIp,
                uri,
                rule,
                message,
                action: 'blocked',
            };
        } catch (error) {
            return null;
        }
    }

    private getSeverity(type: WAFBlockEvent['type']): WAFBlockEvent['severity'] {
        switch (type) {
            case 'rce':
            case 'sqli':
                return 'critical';
            case 'xss':
            case 'lfi':
            case 'rfi':
                return 'high';
            case 'traversal':
            case 'crowdsec':
                return 'medium';
            default:
                return 'low';
        }
    }

    // Fetch logs from APISIX Docker container
    async getRecentEvents(since: string = '1m'): Promise<WAFBlockEvent[]> {
        const events: WAFBlockEvent[] = [];

        try {
            // Try to read from Docker logs
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            const { stdout } = await execAsync(
                `docker logs montara-apisix --since ${since} 2>&1 | grep -E "(blocked|403|WAF)" | tail -50`,
                { timeout: 5000 }
            );

            const lines = stdout.split('\n').filter(Boolean);
            for (const line of lines) {
                const event = this.parseLogLine(line);
                if (event) {
                    events.push(event);
                }
            }
        } catch (error) {
            // Docker not available or no matching logs
            console.log('APISIX log read:', (error as Error).message);
        }

        return events;
    }

    // Get stats from recent events
    async getStats(): Promise<Record<string, number>> {
        const events = await this.getRecentEvents('1h');
        const stats: Record<string, number> = {
            total: events.length,
            sqli: 0,
            xss: 0,
            rce: 0,
            lfi: 0,
            rfi: 0,
            traversal: 0,
            bot: 0,
            rate_limit: 0,
            crowdsec: 0,
        };

        for (const event of events) {
            stats[event.type]++;
        }

        return stats;
    }
}

export const apisixLogReader = new APISIXLogReader();
