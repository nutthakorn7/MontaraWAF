'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  Download, 
  ChevronDown, 
  Settings, 
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Badge, useToast } from '@/components/ui';
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
  Cell
} from 'recharts';
import { apiClient, AttackAnalyticsResponse } from '@/lib/api';

export default function AttackAnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('attack-analytics');
  const [activeTab, setActiveTab] = useState<'home' | 'application' | 'network' | 'data'>('application');
  const [viewTab, setViewTab] = useState<'dashboard' | 'incidents' | 'insights'>('dashboard');
  const [data, setData] = useState<AttackAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { info } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAttackAnalytics();
      setData(response);
    } catch (err) {
      console.error('Failed to fetch attack analytics:', err);
      setError('Failed to connect to API');
      // Use mock data as fallback
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMockData = (): AttackAnalyticsResponse => ({
    analytics: {
      events: '355.7K',
      eventsChange: -36.95,
      incidents: 102,
      incidentsChange: 6.42,
      critical: 4,
      major: 60,
      minor: 38,
    },
    incidentsByOrigin: [
      { country: 'United States', count: 80 },
      { country: 'Russian Federation', count: 11 },
      { country: 'All other origins', count: 7 },
    ],
    topViolations: [
      { name: 'Illegal Resource Access', value: 35, color: '#3B82F6' },
      { name: 'SQL Injection', value: 25, color: '#8B5CF6' },
      { name: 'Cross-Site Scripting', value: 20, color: '#EC4899' },
      { name: 'Bad Bots', value: 15, color: '#F59E0B' },
      { name: 'Other', value: 5, color: '#6B7280' },
    ],
    attackToolTypes: [
      { name: 'Legitimate', value: 15, color: '#10B981' },
      { name: 'Automation Tool', value: 45, color: '#3B82F6' },
      { name: 'Scanner', value: 25, color: '#F59E0B' },
      { name: 'Bot', value: 15, color: '#EF4444' },
    ],
    incidents: [
      { id: 'INC-001', severity: 'critical', title: 'SQL Injection Attack Detected', source: 'api.example.com', action: 'Blocked', time: '2 min ago', status: 'active' },
      { id: 'INC-002', severity: 'major', title: 'Brute Force Login Attempt', source: 'login.site.com', action: 'Blocked', time: '5 min ago', status: 'active' },
      { id: 'INC-003', severity: 'major', title: 'XSS Attack Pattern', source: 'www.store.co.th', action: 'Alerted', time: '12 min ago', status: 'investigating' },
      { id: 'INC-004', severity: 'minor', title: 'Suspicious Bot Activity', source: 'portal.business.com', action: 'Monitored', time: '25 min ago', status: 'resolved' },
    ],
  });

  const incidentChartData = [
    { date: '2. Jan', Critical: 1, Major: 3, Minor: 2 },
    { date: '9. Jan', Critical: 2, Major: 5, Minor: 4 },
    { date: '16. Jan', Critical: 1, Major: 4, Minor: 3 },
    { date: '23. Jan', Critical: 3, Major: 6, Minor: 5 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'major': return 'bg-orange-100 text-orange-700';
      case 'minor': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-imperva-bg-primary dark:bg-gray-900">
        <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-imperva-bg-primary dark:bg-gray-900">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header accountName="OCTO" activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Sub Header with Breadcrumb */}
        <div className="breadcrumb-container">
          <div className="flex items-center gap-2 mb-2">
            <span className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Analytics</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Attack Analytics</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="page-title text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Attack Analytics
              </h1>
              
              <div className="flex gap-1 ml-4">
                {(['dashboard', 'incidents', 'insights'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setViewTab(tab)}
                    className={`tab-btn capitalize ${
                      viewTab === tab ? 'tab-btn-active' : 'tab-btn-inactive'
                    }`}
                  >
                    {tab}
		    </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {error && (
                <span className="flex items-center gap-1 text-sm text-orange-500">
                  <AlertCircle className="w-4 h-4" />
                  Using mock data
                </span>
              )}
              <button onClick={fetchData} className="btn-ghost">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={() => info('Settings', 'Opening analytics settings...')}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 font-medium">HOST</span>
              <button 
                onClick={() => info('Host', 'Host selector opened')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                api.crowninspections.net
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Time range</span>
              <button 
                onClick={() => info('Time Range', 'Time range picker opened')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Last 30 days
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {data && (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Events</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.analytics.events}</span>
                    <span className={`flex items-center gap-1 text-sm ${data.analytics.eventsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.analytics.eventsChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(data.analytics.eventsChange)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Incidents</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.analytics.incidents}</span>
                    <span className={`flex items-center gap-1 text-sm ${data.analytics.incidentsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.analytics.incidentsChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(data.analytics.incidentsChange)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Critical</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{data.analytics.critical}</span>
                        <div className="w-12 h-2 bg-gray-100 rounded"><div className="w-1/3 h-full bg-red-500 rounded" /></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Major</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{data.analytics.major}</span>
                        <div className="w-12 h-2 bg-gray-100 rounded"><div className="w-3/4 h-full bg-orange-500 rounded" /></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Minor</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{data.analytics.minor}</span>
                        <div className="w-12 h-2 bg-gray-100 rounded"><div className="w-1/2 h-full bg-yellow-500 rounded" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-card">
                  <h3 className="text-sm text-gray-600 mb-3">Attack Origins</h3>
                  <div className="space-y-2">
                    {data.incidentsByOrigin.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.country}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-5 shadow-card">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Incidents Over Time</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={incidentChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Critical" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} />
                        <Area type="monotone" dataKey="Major" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.8} />
                        <Area type="monotone" dataKey="Minor" stackId="1" stroke="#FCD34D" fill="#FCD34D" fillOpacity={0.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-5 shadow-card">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Top Violations</h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.topViolations} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value">
                            {data.topViolations.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 shadow-card">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Attack Tool Type</h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.attackToolTypes} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value">
                            {data.attackToolTypes.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incidents Table */}
              <div className="bg-white rounded-lg shadow-card">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">Recent Incidents</h3>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>ID</th><th>Severity</th><th>Title</th><th>Source</th><th>Action</th><th>Time</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.incidents.map((incident) => (
                      <tr 
                        key={incident.id}
                        onClick={() => info('Incident Details', `Viewing incident: ${incident.id} - ${incident.title}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="font-medium text-imperva-blue">{incident.id}</td>
                        <td><span className={`severity-badge ${getSeverityColor(incident.severity)}`}>{incident.severity}</span></td>
                        <td>{incident.title}</td>
                        <td className="text-gray-600">{incident.source}</td>
                        <td><Badge variant={incident.action === 'Blocked' ? 'error' : 'warning'} size="sm">{incident.action}</Badge></td>
                        <td className="text-gray-500">{incident.time}</td>
                        <td><Badge variant={incident.status === 'active' ? 'error' : incident.status === 'investigating' ? 'warning' : 'success'} size="sm">{incident.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
