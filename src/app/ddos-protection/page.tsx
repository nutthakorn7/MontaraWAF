'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { DataTable, Badge } from '@/components/ui';
import { Shield, AlertTriangle, Activity, Zap, Settings, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiClient, DDoSRule, DDoSStats } from '@/lib/api';

export default function DDoSProtectionPage() {
  const [rules, setRules] = useState<DDoSRule[]>([]);
  const [stats, setStats] = useState<DDoSStats | null>(null);
  const [protectionMode, setProtectionMode] = useState<'automatic' | 'always-on' | 'off'>('automatic');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getDDoSStats();
      setStats(response.stats);
      setRules(response.rules);
      setProtectionMode(response.stats.protection_mode as typeof protectionMode);
    } catch (error) {
      console.error('Failed to fetch DDoS stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <AppLayout activeMenu="ddos">
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Network</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">DDoS Protection</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Protection Mode:</span>
          <select 
            value={protectionMode} 
            onChange={e => setProtectionMode(e.target.value as typeof protectionMode)}
            className="form-select text-sm py-1.5"
          >
            <option value="automatic">Automatic</option>
            <option value="always-on">Always On</option>
            <option value="off">Off</option>
          </select>
          <button 
            onClick={fetchData}
            className="btn-ghost"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

        <main className="flex-1 overflow-y-auto p-6">
          {loading && !stats ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${protectionMode === 'off' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center gap-3">
                  {protectionMode === 'off' ? (
                    <XCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  <div>
                    <p className={`font-medium ${protectionMode === 'off' ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                      {protectionMode === 'off' ? 'DDoS Protection is DISABLED' : 'DDoS Protection is ACTIVE'}
                    </p>
                    <p className={`text-sm ${protectionMode === 'off' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {protectionMode === 'automatic' ? 'Automatic mitigation will activate during attacks' : 
                       protectionMode === 'always-on' ? 'All traffic is being scrubbed' : 
                       'Your network is not protected'}
                    </p>
                  </div>
                </div>
                <Shield className={`w-10 h-10 ${protectionMode === 'off' ? 'text-red-300' : 'text-green-300'}`} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Attacks Blocked (30d)</span>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.attacks_blocked || 0}</span>
                </div>
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Peak Mitigation</span>
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-3xl font-bold text-yellow-600">{stats?.peak_mitigation || '-'}</span>
                </div>
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Response Time</span>
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-3xl font-bold text-blue-600">{stats?.avg_response_time || '-'}</span>
                </div>
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-3xl font-bold text-green-600">{stats?.uptime || '-'}</span>
                </div>
              </div>

              {/* Protection Rules */}
              <div className="table-container">
                <div className="table-header flex items-center justify-between">
                  <h3 className="table-title">Protection Rules</h3>
                  <button className="flex items-center gap-1.5 text-sm text-imperva-blue hover:underline">
                    <Settings className="w-4 h-4" /> Advanced Settings
                  </button>
                </div>
                <DataTable<DDoSRule>
                  keyField="id"
                  data={rules}
                  columns={[
                    { key: 'name', header: 'Rule Name' },
                    {
                      key: 'type',
                      header: 'Type',
                      render: (rule) => (
                        <Badge variant={rule.type === 'volumetric' ? 'error' : rule.type === 'protocol' ? 'warning' : 'purple'} size="sm">
                          {rule.type}
                        </Badge>
                      )
                    },
                    { key: 'threshold', header: 'Threshold' },
                    {
                      key: 'action',
                      header: 'Action',
                      render: (rule) => (
                        <Badge 
                          variant={rule.action === 'block' ? 'error' : rule.action === 'challenge' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {rule.action}
                        </Badge>
                      )
                    },
                    {
                      key: 'enabled',
                      header: 'Status',
                      render: (rule) => (
                        <button onClick={() => handleToggle(rule.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      )
                    }
                  ]}
                />
              </div>
            </>
          )}
        </main>
    </AppLayout>
  );
}
