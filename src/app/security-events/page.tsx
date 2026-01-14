'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { DataTable } from '@/components/ui';
import { 
  AlertTriangle, 
  Shield, 
  Bot, 
  Waves,
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';

// Types
interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'sql_injection' | 'xss' | 'bot' | 'ddos' | 'rfi' | 'lfi';
  severity: 'critical' | 'high' | 'medium' | 'low';
  action: 'blocked' | 'alerted' | 'allowed' | 'challenged';
  sourceIP: string;
  country: string;
  targetURL: string;
  userAgent: string;
  ruleId: string;
  ruleName: string;
}

// Mock data generator
const generateMockEvents = (count: number): SecurityEvent[] => {
  const types = ['sql_injection', 'xss', 'bot', 'ddos', 'rfi', 'lfi'] as const;
  const severities = ['critical', 'high', 'medium', 'low'] as const;
  const actions = ['blocked', 'alerted', 'allowed', 'challenged'] as const;
  const countries = ['US', 'CN', 'RU', 'DE', 'BR', 'TH', 'JP', 'KR'];
  const urls = ['/api/users', '/login', '/admin', '/search', '/checkout', '/api/products'];
  
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id: `evt-${String(i + 1).padStart(5, '0')}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      type,
      severity: severities[Math.floor(Math.random() * severities.length)],
      action: actions[Math.floor(Math.random() * 3)], // Mostly blocked/alerted
      sourceIP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      targetURL: urls[Math.floor(Math.random() * urls.length)],
      userAgent: 'Mozilla/5.0 (compatible; bot/1.0)',
      ruleId: `rule-00${Math.floor(Math.random() * 7) + 1}`,
      ruleName: type === 'sql_injection' ? 'SQL Injection Protection' : 
                type === 'xss' ? 'XSS Protection' :
                type === 'bot' ? 'Bot Detection' : 'Security Rule',
    };
  });
};

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    setEvents(generateMockEvents(50));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Add new event at the top
        const newEvent = generateMockEvents(1)[0];
        newEvent.id = `evt-${Date.now()}`;
        newEvent.timestamp = new Date().toISOString();
        setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sql_injection': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'xss': return <Shield className="w-4 h-4 text-orange-500" />;
      case 'bot': return <Bot className="w-4 h-4 text-purple-500" />;
      case 'ddos': return <Waves className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getActionBadge = (action: string) => {
    const badges = {
      blocked: { color: 'bg-red-500 text-white', icon: <Ban className="w-3 h-3" /> },
      alerted: { color: 'bg-yellow-500 text-white', icon: <AlertTriangle className="w-3 h-3" /> },
      allowed: { color: 'bg-green-500 text-white', icon: <CheckCircle className="w-3 h-3" /> },
      challenged: { color: 'bg-blue-500 text-white', icon: <Shield className="w-3 h-3" /> },
    };
    return badges[action as keyof typeof badges] || { color: 'bg-gray-500 text-white', icon: null };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filteredEvents = events.filter(event => {
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesAction = filterAction === 'all' || event.action === filterAction;
    const matchesSearch = searchQuery === '' || 
      event.sourceIP.includes(searchQuery) ||
      event.targetURL.includes(searchQuery) ||
      event.ruleName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesType && matchesAction && matchesSearch;
  });

  const stats = {
    total: events.length,
    blocked: events.filter(e => e.action === 'blocked').length,
    critical: events.filter(e => e.severity === 'critical').length,
    lastHour: events.filter(e => new Date(e.timestamp) > new Date(Date.now() - 3600000)).length,
  };

  return (
    <AppLayout activeMenu="security-events">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Security Events</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title text-xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Security Events
              </h1>
              <p className="page-subtitle mt-1">
                Real-time security event monitoring and analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  autoRefresh 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Hour</p>
              <p className="text-2xl font-bold text-imperva-blue">{stats.lastHour}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card mb-6 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by IP, URL, or rule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-imperva-blue"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="form-select"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select"
              >
                <option value="all">All Types</option>
                <option value="sql_injection">SQL Injection</option>
                <option value="xss">XSS</option>
                <option value="bot">Bot</option>
                <option value="ddos">DDoS</option>
              </select>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="form-select"
              >
                <option value="all">All Actions</option>
                <option value="blocked">Blocked</option>
                <option value="alerted">Alerted</option>
                <option value="challenged">Challenged</option>
              </select>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
            <DataTable<SecurityEvent>
              keyField="id"
              data={filteredEvents.slice(0, 20)}
              onRowClick={(event) => setSelectedEvent(event)}
              columns={[
                {
                  key: 'timestamp',
                  header: 'Time',
                  render: (event) => (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.timestamp)}
                    </div>
                  )
                },
                {
                  key: 'type',
                  header: 'Type',
                  render: (event) => (
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.type)}
                      <span className="text-sm capitalize">{event.type.replace('_', ' ')}</span>
                    </div>
                  )
                },
                {
                  key: 'severity',
                  header: 'Severity',
                  render: (event) => (
                    <span className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getSeverityBadge(event.severity)}`}>
                      {event.severity}
                    </span>
                  )
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (event) => (
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${getActionBadge(event.action).color}`}>
                      {getActionBadge(event.action).icon}
                      {event.action}
                    </span>
                  )
                },
                {
                  key: 'sourceIP',
                  header: 'Source',
                  render: (event) => (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <span className="font-mono">{event.sourceIP}</span>
                      <span className="text-gray-400">({event.country})</span>
                    </div>
                  )
                },
                {
                  key: 'targetURL',
                  header: 'Target',
                  render: (event) => <span className="text-sm font-mono text-imperva-blue">{event.targetURL}</span>
                },
                { key: 'ruleName', header: 'Rule' }
              ]}
            />
          </div>
        </main>

      {/* Event Detail Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedEvent(null)}>
          <div 
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Event Details</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Event ID</p>
                  <p className="font-mono">{selectedEvent.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p>{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="capitalize">{selectedEvent.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source IP</p>
                  <p className="font-mono">{selectedEvent.sourceIP}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p>{selectedEvent.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Target URL</p>
                  <p className="font-mono text-imperva-blue">{selectedEvent.targetURL}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Agent</p>
                  <p className="text-sm">{selectedEvent.userAgent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rule Triggered</p>
                  <p>{selectedEvent.ruleName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
