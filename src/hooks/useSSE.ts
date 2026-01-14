'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SecurityEvent } from './useWebSocket';

interface UseSSEOptions {
    onEvent?: (event: SecurityEvent) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    maxEvents?: number;
}

export function useSSE(options: UseSSEOptions = {}) {
    const { onEvent, onConnect, onDisconnect, maxEvents = 100 } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const connect = useCallback(() => {
        if (eventSourceRef.current) return;

        try {
            const eventSource = new EventSource('/api/v1/events/stream');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                setError(null);
                onConnect?.();
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'init') {
                        // Initial batch of events
                        setEvents(data.events);
                    } else if (data.type === 'event') {
                        // Single new event
                        setEvents((prev) => {
                            const updated = [data.event, ...prev];
                            return updated.slice(0, maxEvents);
                        });
                        onEvent?.(data.event);
                    }
                } catch (e) {
                    console.error('Failed to parse SSE message:', e);
                }
            };

            eventSource.onerror = () => {
                setIsConnected(false);
                setError('Connection lost. Reconnecting...');
                onDisconnect?.();

                // Try to reconnect
                setTimeout(() => {
                    disconnect();
                    connect();
                }, 5000);
            };
        } catch (e) {
            setError('Failed to connect to event stream');
        }
    }, [onEvent, onConnect, onDisconnect, maxEvents]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsConnected(false);
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
