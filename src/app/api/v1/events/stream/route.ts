import { NextRequest } from 'next/server';

// Generate mock security event
function generateEvent() {
    const types = ['SQL Injection', 'XSS Attack', 'Bot Activity', 'Path Traversal', 'DDoS Attack', 'Brute Force'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const actions = ['Blocked', 'Alerted', 'Monitored'];
    const ips = ['192.168.1.100', '10.0.0.55', '172.16.0.25', '45.33.32.156', '91.134.232.89'];
    const urls = ['/login', '/api/users', '/admin', '/search', '/checkout'];

    return {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        source_ip: ips[Math.floor(Math.random() * ips.length)],
        target_url: urls[Math.floor(Math.random() * urls.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        details: 'Known attack signature detected',
        timestamp: new Date().toISOString(),
    };
}

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial batch of events
            const initialEvents = Array.from({ length: 10 }, () => generateEvent());
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', events: initialEvents })}\n\n`));

            // Send periodic events
            const interval = setInterval(() => {
                const event = generateEvent();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'event', event })}\n\n`));
            }, 3000 + Math.random() * 2000);

            // Handle client disconnect
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
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
