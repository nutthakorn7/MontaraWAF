'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket, SecurityEvent } from '@/hooks/useWebSocket';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Shield, 
  Trash2,
  Bell,
  Circle
} from 'lucide-react';

interface LiveEventsProps {
  maxVisible?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const severityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const severityTextColors = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-blue-600',
};

export default function LiveEvents({ maxVisible = 10, showHeader = true, compact = false }: LiveEventsProps) {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const { isConnected, events, clearEvents, error } = useWebSocket({
    onEvent: (event) => {
      if (showNotification && event.severity === 'critical') {
        // Could trigger browser notification here
      }
    },
    maxEvents: 50,
  });

  const visibleEvents = events.slice(0, maxVisible);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-imperva-blue" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Security Events</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({events.length} events)</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {isConnected ? (
                <>
                  <Circle className="w-2 h-2 fill-current animate-pulse" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Disconnected
                </>
              )}
            </div>
            
            {/* Notification Toggle */}
            <button
              onClick={() => setShowNotification(!showNotification)}
              className={`p-1.5 rounded-lg transition-colors ${
                showNotification ? 'text-imperva-blue bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500'
              }`}
              title="Toggle notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            
            {/* Clear Events */}
            <button
              onClick={clearEvents}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
              title="Clear events"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Events List */}
      <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${compact ? 'max-h-64' : 'max-h-96'} overflow-y-auto bg-white dark:bg-gray-900`}>
        {visibleEvents.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for events...</p>
            <p className="text-xs mt-1">{isConnected ? 'Connected to WebSocket' : 'Connecting...'}</p>
          </div>
        ) : (
          visibleEvents.map((event, idx) => (
            <div 
              key={event.id} 
              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${idx === 0 ? 'bg-imperva-blue/5 dark:bg-imperva-blue/10' : 'bg-white dark:bg-gray-900'}`}
              style={{ animation: idx === 0 ? 'fadeIn 0.3s ease-out' : undefined }}
            >
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className={`w-2 h-2 rounded-full mt-2 ${severityColors[event.severity]}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">{event.type}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{formatTime(event.timestamp)}</span>
                  </div>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${severityTextColors[event.severity]} bg-current/10`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {event.source_ip} → {event.target_url}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${
                      event.action === 'Blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      event.action === 'Alerted' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {event.action}
                    </span>
                  </div>
                  
                  {!compact && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{event.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {events.length > maxVisible && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
          <button 
            onClick={() => router.push('/security-events')}
            className="text-sm text-imperva-blue hover:underline"
          >
            View all {events.length} events →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
