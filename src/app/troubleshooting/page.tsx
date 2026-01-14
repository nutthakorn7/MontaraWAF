'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Badge, useToast } from '@/components/ui';
import { HelpCircle, Search, AlertCircle, CheckCircle, Clock, Filter, ExternalLink } from 'lucide-react';

const logs = [
  { id: 1, time: '00:53:42', level: 'error', source: 'WAF', message: 'Rule 942100 triggered - SQL Injection attempt blocked', ip: '192.168.1.45' },
  { id: 2, time: '00:53:35', level: 'warning', source: 'Bot', message: 'Suspicious crawler detected but allowed (whitelist)', ip: '10.0.0.123' },
  { id: 3, time: '00:53:28', level: 'info', source: 'CDN', message: 'Cache purge completed for domain example.com', ip: 'system' },
  { id: 4, time: '00:53:15', level: 'error', source: 'SSL', message: 'Certificate validation failed for api.example.com', ip: 'system' },
  { id: 5, time: '00:52:58', level: 'info', source: 'WAF', message: 'Configuration updated by admin@example.com', ip: '172.16.0.1' },
];

const issues = [
  { title: 'High latency on API endpoints', severity: 'high', status: 'investigating', updated: '5 min ago' },
  { title: 'Certificate expiring in 7 days', severity: 'medium', status: 'pending', updated: '1 hour ago' },
  { title: 'Rule conflict detected', severity: 'low', status: 'resolved', updated: '3 hours ago' },
];

export default function TroubleshootingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const { info, success, warning } = useToast();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'info': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <AppLayout activeMenu="troubleshooting">
      {/* Page Header with Breadcrumb */}
      <div className="breadcrumb-container">
        <div className="flex items-center gap-2 mb-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Tools</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Troubleshooting</span>
        </div>
        <h1 className="page-title text-xl flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-orange-500" />
          Troubleshooting
          <span className="ml-2 px-2 py-0.5 text-xs bg-imperva-blue text-white rounded">NEW</span>
        </h1>
        <p className="page-subtitle mt-1">Debug and diagnose issues</p>
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Active Issues */}
          <div className="card-container-padded">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Active Issues</h3>
            <div className="space-y-3">
              {issues.map((issue, idx) => (
                <div key={idx} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{issue.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated {issue.updated}</p>
                    </div>
                    <Badge 
                      variant={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    {issue.status === 'resolved' ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle className="w-3 h-3" />Resolved</span>
                    ) : issue.status === 'investigating' ? (
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400"><Clock className="w-3 h-3" />Investigating</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400"><AlertCircle className="w-3 h-3" />Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Viewer */}
          <div className="lg:col-span-2 table-container">
            <div className="table-header">
              <div className="flex items-center justify-between">
                <h3 className="table-title">System Logs</h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={logLevel} 
                    onChange={(e) => setLogLevel(e.target.value)} 
                    className="form-select text-sm py-1"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Errors</option>
                    <option value="warning">Warnings</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-b-lg max-h-80 overflow-y-auto font-mono text-sm">
              {logs.filter(l => logLevel === 'all' || l.level === logLevel).map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-1.5 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-500">{log.time}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium uppercase ${getLevelColor(log.level)}`}>{log.level}</span>
                  <span className="text-blue-600 dark:text-blue-400">[{log.source}]</span>
                  <span className="text-gray-700 dark:text-gray-300 flex-1">{log.message}</span>
                  <span className="text-gray-500 dark:text-gray-500">{log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => info('Search Logs', 'Opening log search...')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <Search className="w-5 h-5 text-imperva-blue mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Search Logs</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Full-text search</p>
            </button>
            <button 
              onClick={() => warning('Diagnostics', 'Running system diagnostics...')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-orange-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Run Diagnostics</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">System health check</p>
            </button>
            <button 
              onClick={() => success('Export', 'Exporting logs to CSV...')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-green-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Export Logs</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download as CSV</p>
            </button>
            <button 
              onClick={() => info('Support', 'Opening support ticket form...')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-purple-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Contact Support</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Open ticket</p>
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
