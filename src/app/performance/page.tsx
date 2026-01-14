'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { DataTable } from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Gauge,
  HardDrive,
  RefreshCw,
  Download,
  Clock,
  Globe
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Generate time series data
const generateTimeData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const passed = Math.floor(Math.random() * 50000) + 30000;
    const cached = Math.floor(Math.random() * 30000) + 20000;
    const blocked = Math.floor(Math.random() * 5000) + 1000;
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      passed,
      cached,
      blocked,
      total: passed + cached + blocked,
    });
  }
  return data;
};

const trafficData = generateTimeData();

const cacheDistribution = [
  { name: 'Cache Hit', value: 68, color: '#10B981' },
  { name: 'Cache Miss', value: 25, color: '#F59E0B' },
  { name: 'Bypass', value: 7, color: '#6B7280' },
];

const originResponseData = [
  { region: 'Asia Pacific', avgTime: 45, p95: 120, p99: 250 },
  { region: 'Europe', avgTime: 85, p95: 180, p99: 320 },
  { region: 'North America', avgTime: 35, p95: 95, p99: 180 },
  { region: 'South America', avgTime: 120, p95: 250, p99: 450 },
  { region: 'Middle East', avgTime: 95, p95: 200, p99: 380 },
];

const bandwidthData = [
  { hour: '00:00', inbound: 2.4, outbound: 1.8, saved: 1.2 },
  { hour: '04:00', inbound: 1.2, outbound: 0.9, saved: 0.8 },
  { hour: '08:00', inbound: 4.5, outbound: 3.2, saved: 2.1 },
  { hour: '12:00', inbound: 6.8, outbound: 5.1, saved: 3.5 },
  { hour: '16:00', inbound: 7.2, outbound: 5.5, saved: 3.8 },
  { hour: '20:00', inbound: 5.5, outbound: 4.2, saved: 2.9 },
];

export default function PerformanceDashboardPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // Stats
  const stats = {
    totalBandwidth: '156 GB',
    bandwidthSaved: '98 GB',
    cacheHitRatio: '68%',
    avgResponseTime: '45ms',
    bandwidthChange: 12,
    savedChange: 25,
    cacheChange: 5,
    responseChange: -15,
  };

  return (
    <AppLayout activeMenu="performance">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Performance' },
            { label: 'Dashboard' }
          ]}
          actions={
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-select text-sm py-1.5"
              >
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
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
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Bandwidth</span>
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBandwidth}</span>
                <span className={`text-sm flex items-center ${stats.bandwidthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.bandwidthChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.bandwidthChange)}%
                </span>
              </div>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Bandwidth Saved</span>
                <HardDrive className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">{stats.bandwidthSaved}</span>
                <span className={`text-sm flex items-center ${stats.savedChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.savedChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.savedChange)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">62.8% savings ratio</p>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Cache Hit Ratio</span>
                <Gauge className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.cacheHitRatio}</span>
                <span className={`text-sm flex items-center ${stats.cacheChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.cacheChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.cacheChange)}%
                </span>
              </div>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</span>
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgResponseTime}</span>
                <span className={`text-sm flex items-center ${stats.responseChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.responseChange <= 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.responseChange)}%
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Requests Over Time</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Passed to Origin</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Cached</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">Blocked</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                  <Area type="monotone" dataKey="passed" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="cached" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="blocked" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cache & Response Times */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Cache Distribution */}
            <div className="card-container-padded">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Cache Distribution</h3>
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cacheDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {cacheDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {cacheDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bandwidth Usage */}
            <div className="card-container-padded">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bandwidth Usage (GB)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bandwidthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inbound" fill="#3B82F6" name="Inbound" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outbound" fill="#8B5CF6" name="Outbound" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saved" fill="#10B981" name="Saved" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Origin Response Times by Region */}
          <div className="card-container-padded">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Origin Response Times by Region</h3>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
            <DataTable
              keyField="region"
              data={originResponseData}
              columns={[
                { key: 'region', header: 'Region' },
                {
                  key: 'avgTime',
                  header: 'Avg (ms)',
                  align: 'right' as const,
                  render: (row) => (
                    <span className={`text-sm font-medium ${row.avgTime < 50 ? 'text-green-600' : row.avgTime < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {row.avgTime}
                    </span>
                  )
                },
                { key: 'p95', header: 'P95 (ms)', align: 'right' as const },
                { key: 'p99', header: 'P99 (ms)', align: 'right' as const },
                {
                  key: 'performance',
                  header: 'Performance',
                  render: (row) => (
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${row.avgTime < 50 ? 'bg-green-500' : row.avgTime < 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (150 - row.avgTime) / 1.5)}%` }}
                      />
                    </div>
                  )
                }
              ]}
            />
          </div>
        </main>
    </AppLayout>
  );
}
