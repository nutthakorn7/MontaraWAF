// React Hook for Real-time WAF Events
// Connects to SSE endpoint and provides events to components

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface WAFEvent {
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

interface UseWAFEventsOptions {
    maxEvents?: number;
    autoConnect?: boolean;
}

interface UseWAFEventsReturn {
    events: WAFEvent[];
    isConnected: boolean;
    error: Error | null;
    connect: () => void;
    disconnect: () => void;
    clearEvents: () => void;
    stats: {
        total: number;
        blocked: number;
        challenged: number;
        logged: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
    };
}

export function useWAFEvents(options: UseWAFEventsOptions = {}): UseWAFEventsReturn {
    const { maxEvents = 100, autoConnect = true } = options;

    const [events, setEvents] = useState<WAFEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            const eventSource = new EventSource('/api/v1/waf/events');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                setError(null);
                console.log('WAF Events: Connected');
            };

            eventSource.onmessage = (event) => {
                try {
                    const wafEvent: WAFEvent = JSON.parse(event.data);
                    setEvents((prev) => {
                        const newEvents = [wafEvent, ...prev];
                        return newEvents.slice(0, maxEvents);
                    });
                } catch (e) {
                    console.error('Failed to parse WAF event:', e);
                }
            };

            eventSource.onerror = (e) => {
                console.error('WAF Events: Connection error', e);
                setIsConnected(false);
                setError(new Error('Connection lost'));

                // Auto reconnect after 5 seconds
                if (!reconnectTimeoutRef.current) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectTimeoutRef.current = null;
                        connect();
                    }, 5000);
                }
            };
        } catch (e) {
            setError(e as Error);
            setIsConnected(false);
        }
    }, [maxEvents]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    // Calculate stats from events
    const stats = {
        total: events.length,
        blocked: events.filter(e => e.action === 'blocked').length,
        challenged: events.filter(e => e.action === 'challenged').length,
        logged: events.filter(e => e.action === 'logged').length,
        bySeverity: events.reduce((acc, e) => {
            acc[e.severity] = (acc[e.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        byType: events.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    // Auto connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        events,
        isConnected,
        error,
        connect,
        disconnect,
        clearEvents,
        stats,
    };
}
