// Real-time WAF Events SSE Endpoint
// Streams security events from CrowdSec and Coraza to Dashboard

import { NextRequest } from 'next/server';

interface WAFEvent {
    id: string;
    timestamp: string;
    type: 'waf' | 'ddos' | 'bot' | 'decision';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    source: string;
    sourceIp: string;
    country?: string;
    action: 'blocked' | 'challenged' | 'logged';
    rule?: {
        id: string;
        name: string;
        category: string;
    };
    request?: {
        method: string;
        uri: string;
        userAgent?: string;
    };
    message: string;
}

// Event source URLs
const CROWDSEC_EVENTS_URL = process.env.CROWDSEC_API_URL || 'http://localhost:8080';
const CORAZA_LOG_PATH = process.env.CORAZA_LOG_PATH || '/var/log/coraza/audit.log';

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            const sendEvent = (event: WAFEvent) => {
                const data = `data: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(data));
            };

            // Send ping every 30 seconds to keep connection alive
            const pingInterval = setInterval(() => {
                controller.enqueue(encoder.encode(': ping\n\n'));
            }, 30000);

            // Poll CrowdSec for new alerts
            let lastAlertTime = new Date().toISOString();

            const pollCrowdSec = async () => {
                try {
                    const res = await fetch(
                        `${CROWDSEC_EVENTS_URL}/v1/alerts?since=${lastAlertTime}`,
                        {
                            headers: {
                                'X-Api-Key': process.env.CROWDSEC_BOUNCER_KEY || '',
                            },
                        }
                    );

                    if (res.ok) {
                        const alerts = await res.json();
                        for (const alert of alerts) {
                            const event: WAFEvent = {
                                id: `cs-${alert.id}`,
                                timestamp: alert.created_at || new Date().toISOString(),
                                type: getEventType(alert.scenario),
                                severity: getSeverity(alert.scenario),
                                source: 'crowdsec',
                                sourceIp: alert.source?.ip || 'unknown',
                                country: alert.source?.cn,
                                action: 'blocked',
                                rule: {
                                    id: alert.scenario || 'unknown',
                                    name: alert.scenario || 'Unknown',
                                    category: getCategory(alert.scenario),
                                },
                                message: alert.message || `Alert: ${alert.scenario}`,
                            };
                            sendEvent(event);
                            lastAlertTime = alert.created_at;
                        }
                    }
                } catch (error) {
                    console.error('CrowdSec poll error:', error);
                }
            };

            // Poll every 2 seconds
            const crowdsecInterval = setInterval(pollCrowdSec, 2000);

            // Initial poll
            await pollCrowdSec();

            // Generate mock events for demo (remove in production)
            if (process.env.NODE_ENV === 'development') {
                const mockInterval = setInterval(() => {
                    sendEvent(generateMockEvent());
                }, 5000);

                request.signal.addEventListener('abort', () => {
                    clearInterval(mockInterval);
                });
            }

            // Cleanup on disconnect
            request.signal.addEventListener('abort', () => {
                clearInterval(pingInterval);
                clearInterval(crowdsecInterval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

function getEventType(scenario: string): WAFEvent['type'] {
    if (!scenario) return 'waf';
    if (scenario.includes('ddos') || scenario.includes('flood')) return 'ddos';
    if (scenario.includes('bot') || scenario.includes('crawler') || scenario.includes('scanner')) return 'bot';
    if (scenario.includes('ban') || scenario.includes('captcha')) return 'decision';
    return 'waf';
}

function getSeverity(scenario: string): WAFEvent['severity'] {
    if (!scenario) return 'medium';
    if (scenario.includes('sqli') || scenario.includes('rce') || scenario.includes('exploit')) return 'critical';
    if (scenario.includes('xss') || scenario.includes('lfi') || scenario.includes('rfi')) return 'high';
    if (scenario.includes('bruteforce') || scenario.includes('scan')) return 'medium';
    return 'low';
}

function getCategory(scenario: string): string {
    if (!scenario) return 'unknown';
    if (scenario.includes('http')) return 'HTTP Attack';
    if (scenario.includes('ssh')) return 'SSH Attack';
    if (scenario.includes('sql')) return 'SQL Injection';
    if (scenario.includes('xss')) return 'XSS';
    return 'Security';
}

function generateMockEvent(): WAFEvent {
    const types: WAFEvent['type'][] = ['waf', 'ddos', 'bot', 'decision'];
    const severities: WAFEvent['severity'][] = ['critical', 'high', 'medium', 'low'];
    const actions: WAFEvent['action'][] = ['blocked', 'challenged', 'logged'];
    const countries = ['US', 'CN', 'RU', 'DE', 'FR', 'BR', 'IN', 'JP'];

    const rules = [
        { id: '942100', name: 'SQL Injection Attack', category: 'SQLi' },
        { id: '941100', name: 'XSS Attack Detected', category: 'XSS' },
        { id: '930100', name: 'Path Traversal Attack', category: 'LFI' },
        { id: 'bot-detector', name: 'Bot Detected', category: 'Bot' },
        { id: 'rate-limit', name: 'Rate Limit Exceeded', category: 'DDoS' },
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const rule = rules[Math.floor(Math.random() * rules.length)];

    return {
        id: `mock-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type,
        severity: severities[Math.floor(Math.random() * severities.length)],
        source: Math.random() > 0.5 ? 'crowdsec' : 'coraza',
        sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        rule,
        request: {
            method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
            uri: ['/api/users', '/login', '/admin', '/wp-admin', '/api/v1/data'][Math.floor(Math.random() * 5)],
        },
        message: `${rule.name} from ${rule.category}`,
    };
}
