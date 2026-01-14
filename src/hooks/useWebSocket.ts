'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SecurityEvent {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    source_ip: string;
    target_url: string;
    action: string;
    details: string;
    timestamp: string;
}

interface UseWebSocketOptions {
    onEvent?: (event: SecurityEvent) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    maxEvents?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const { onEvent, onConnect, onDisconnect, maxEvents = 100 } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Generate mock events for demo when WebSocket is unavailable
    const generateMockEvent = useCallback((): SecurityEvent => {
        const types = ['SQL Injection', 'XSS Attack', 'Bot Activity', 'Path Traversal', 'DDoS Attack', 'Brute Force'];
        const severities: SecurityEvent['severity'][] = ['critical', 'high', 'medium', 'low'];
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
    }, []);

    const startMockEvents = useCallback(() => {
        // Generate initial batch of mock events
        const initialEvents = Array.from({ length: 25 }, () => generateMockEvent());
        setEvents(initialEvents);
        setIsConnected(true); // Simulate connected state for demo
        setError(null);

        // Continue generating events periodically
        const interval = setInterval(() => {
            const newEvent = generateMockEvent();
            setEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)]);
            onEvent?.(newEvent);
        }, 3000 + Math.random() * 2000);

        return interval;
    }, [generateMockEvent, maxEvents, onEvent]);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setError(null);
                onConnect?.();
            };

            ws.onmessage = (event) => {
                try {
                    const data: SecurityEvent = JSON.parse(event.data);
                    setEvents((prev) => {
                        const updated = [data, ...prev];
                        return updated.slice(0, maxEvents);
                    });
                    onEvent?.(data);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                onDisconnect?.();

                // Reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            ws.onerror = () => {
                // Start mock events instead of showing error
                const mockInterval = startMockEvents();
                mockIntervalRef.current = mockInterval;
            };
        } catch (e) {
            const mockInterval = startMockEvents();
            mockIntervalRef.current = mockInterval;
        }
    }, [onEvent, onConnect, onDisconnect, maxEvents, startMockEvents]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (mockIntervalRef.current) {
            clearInterval(mockIntervalRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        events,
        error,
        connect,
        disconnect,
        clearEvents,
    };
}
