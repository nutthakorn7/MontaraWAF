'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  AlertTriangle,
  MoreVertical,
  RefreshCw,
  Download,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiClient, SecurityDashboardResponse } from '@/lib/api';

export default function SecurityDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('security-dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'application' | 'network' | 'data'>('application');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SecurityDashboardResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSecurityDashboard();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Connect to WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Handle SecurityEvent
        // Assuming message structure matches backend SecurityEvent
        if (message.type) {
            handleRealTimeEvent(message);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleRealTimeEvent = (event: any) => {
      setData(prevData => {
          if (!prevData) return prevData;
          
          const newDistribution = { ...prevData.distribution };
          // Naive update logic for demo purposes
          // In a real app, you'd parse strings to ints, increment, and format back
          
          // Increment total requests count (simple string replacement for demo visual)
          // newDistribution.allRequests = incrementString(newDistribution.allRequests);
          
          // If blocked, increment blocked
          if (event.action === 'Blocked') {
             // newDistribution.requestsBlocked = ...
          }

          // Update charts if needed
          // For now, let's just trigger a re-render or show a toast log
          // Real-time event handled

          return { ...prevData, distribution: newDistribution };
      });
  };

  // Stats summary (with fallback to skeletons or "0" if loading)
  const stats = {
    totalRequests: data?.distribution.allRequests || '-',
    requestsBlocked: data?.distribution.requestsBlocked || '-',
    wafSessions: data?.distribution.wafSessions || '-',
    ddosAttacks: 12, // Still mocked as it was not in API response distribution
    totalChange: data?.distribution.allChange || 0,
    blockedChange: data?.distribution.blockedChange || 0,
    sessionsChange: data?.distribution.sessionsChange || 0,
    ddosChange: 50,
  };

  return (
    <div className="flex h-screen bg-imperva-bg-primary dark:bg-gray-900">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          accountName="Your_Account_Name"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Breadcrumb & Actions */}
        <div className="breadcrumb-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Security</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Security Dashboard</span>
            {isConnected && (
                <Badge variant="success" size="sm" icon={<Activity className="w-3 h-3" />} className="ml-2 animate-pulse">
                    Live
                </Badge>
            )}
            {!isConnected && !loading && (
                <Badge variant="default" size="sm" className="ml-2">
                    Offline
                </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
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
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Requests</span>
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRequests}</span>
                <span className={`text-sm flex items-center ${stats.totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.totalChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.totalChange)}%
                </span>
              </div>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Requests Blocked</span>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.requestsBlocked}</span>
                <span className={`text-sm flex items-center ${stats.blockedChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {stats.blockedChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.blockedChange)}%
                </span>
              </div>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">WAF Sessions</span>
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.wafSessions}</span>
                <span className={`text-sm flex items-center ${stats.sessionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.sessionsChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.sessionsChange)}%
                </span>
              </div>
            </div>

            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">DDoS Attacks</span>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.ddosAttacks}</span>
                <span className={`text-sm flex items-center ${stats.ddosChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {stats.ddosChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(stats.ddosChange)}%
                </span>
              </div>
            </div>
          </div>

          {!data && loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
            </div>
          ) : (
            <>
              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Violations by Type */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Threats by Violation Type</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.violationTypes || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {(data?.violationTypes || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {(data?.violationTypes || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions by Source */}
                <div className="bg-white rounded-xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Actions Taken by Source IP</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.actionsBySource || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {(data?.actionsBySource || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {(data?.actionsBySource || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attack Timeline */}
              <div className="bg-white rounded-xl p-5 shadow-card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Attacks Over Time</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-gray-600">Total Attacks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-gray-600">Blocked</span>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.attackTimeSeries || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="attacks" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="blocked" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tables Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Top Attackers */}
                <div className="bg-white rounded-xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Top Attackers</h3>
                    <button className="text-sm text-imperva-blue hover:underline">View All</button>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                        <th className="pb-3 font-medium">Source IP</th>
                        <th className="pb-3 font-medium">Location</th>
                        <th className="pb-3 font-medium text-right">Attacks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.topAttackers || []).map((attacker, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3">
                            <span className="font-mono text-sm text-gray-900">{attacker.ip}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm">
                              {attacker.flag} {attacker.country}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm font-medium text-red-600">{attacker.attacks.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Triggered Policies */}
                <div className="bg-white rounded-xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Triggered Policies</h3>
                    <button className="text-sm text-imperva-blue hover:underline">Manage Policies</button>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                        <th className="pb-3 font-medium">Policy Name</th>
                        <th className="pb-3 font-medium">Severity</th>
                        <th className="pb-3 font-medium text-right">Triggers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.triggeredPolicies || []).map((policy, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3">
                            <span className="text-sm text-imperva-blue hover:underline cursor-pointer">{policy.policy}</span>
                          </td>
                          <td className="py-3">
                            <Badge 
                              variant={policy.severity === 'critical' ? 'error' : policy.severity === 'high' ? 'warning' : 'warning'}
                              size="sm"
                            >
                              {policy.severity}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">{policy.triggers.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
