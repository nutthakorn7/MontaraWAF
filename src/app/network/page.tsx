'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { DataTable, Badge } from '@/components/ui';
import { 
  Network, 
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Wifi,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Generate network data
const generateNetworkData = () => {
  return Array.from({ length: 60 }, (_, i) => ({
    time: `${i}s`,
    bps: Math.floor(Math.random() * 500) + 100, // Mbps
    pps: Math.floor(Math.random() * 50000) + 10000,
    passed: Math.floor(Math.random() * 400) + 80,
    blocked: Math.floor(Math.random() * 100) + 20,
  }));
};

const ddosAttacks = [
  { id: 1, type: 'UDP Flood', status: 'mitigated', peakBps: '2.5 Gbps', peakPps: '1.2M', duration: '12 min', time: '2 hours ago' },
  { id: 2, type: 'SYN Flood', status: 'mitigated', peakBps: '800 Mbps', peakPps: '500K', duration: '5 min', time: '6 hours ago' },
  { id: 3, type: 'HTTP Flood', status: 'active', peakBps: '150 Mbps', peakPps: '80K', duration: '3 min', time: 'Now' },
  { id: 4, type: 'DNS Amplification', status: 'mitigated', peakBps: '4.2 Gbps', peakPps: '2.1M', duration: '18 min', time: '1 day ago' },
];

export default function NetworkDashboardPage() {
  const [networkData, setNetworkData] = useState(generateNetworkData());
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(false);

  // Stats
  const stats = {
    currentBps: '245 Mbps',
    currentPps: '32.5K',
    peakBps: '4.2 Gbps',
    ddosBlocked: 4,
    bpsChange: 12,
    ppsChange: -5,
    peakChange: 0,
    ddosChange: 100,
  };

  const refreshData = () => {
    setLoading(true);
    setNetworkData(generateNetworkData());
    setTimeout(() => setLoading(false), 500);
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData(generateNetworkData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout activeMenu="network">
        {/* Breadcrumb & Actions */}
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Network' },
            { label: 'Dashboard' }
          ]}
          actions={
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-select text-sm py-1.5"
              >
                <option value="1m">Last 1 minute</option>
                <option value="5m">Last 5 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
              </select>
              <button 
                onClick={refreshData}
                className="btn-ghost"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="btn-add">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          }
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current BPS</span>
                <Network className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentBps}</span>
                <span className={`text-sm flex items-center ${stats.bpsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.bpsChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.bpsChange)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bits per second</p>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current PPS</span>
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentPps}</span>
                <span className={`text-sm flex items-center ${stats.ppsChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.ppsChange <= 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.ppsChange)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Packets per second</p>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Peak BPS (24h)</span>
                <Server className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">{stats.peakBps}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum bandwidth</p>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">DDoS Attacks Blocked</span>
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">{stats.ddosBlocked}</span>
                <span className="text-sm text-green-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {stats.ddosChange}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 24 hours</p>
            </div>
          </div>

          {/* BPS Chart */}
          <div className="card-container-padded mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Bandwidth (Mbps)</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">Blocked</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} interval={9} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="passed" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Passed" />
                  <Area type="monotone" dataKey="blocked" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Blocked" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PPS Chart */}
          <div className="card-container-padded mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Packets Per Second (PPS)</h3>
              <Wifi className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} interval={9} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                  <Line type="monotone" dataKey="pps" stroke="#8B5CF6" strokeWidth={2} dot={false} name="PPS" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DDoS Attacks Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent DDoS Attacks</h3>
              <button className="text-sm text-imperva-blue hover:underline">View All</button>
            </div>
            <DataTable
              keyField="id"
              data={ddosAttacks}
              columns={[
                {
                  key: 'type',
                  header: 'Attack Type',
                  render: (attack) => (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${attack.status === 'active' ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{attack.type}</span>
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (attack) => (
                    <Badge 
                      variant={attack.status === 'active' ? 'error' : 'success'}
                      size="sm"
                    >
                      {attack.status === 'active' ? '🔴 Active' : '✓ Mitigated'}
                    </Badge>
                  )
                },
                { key: 'peakBps', header: 'Peak BPS' },
                { key: 'peakPps', header: 'Peak PPS' },
                { key: 'duration', header: 'Duration' },
                { key: 'time', header: 'Time' }
              ]}
            />
          </div>
        </main>
    </AppLayout>
  );
}
