'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  Activity, 
  Users, 
  Bot, 
  ShieldOff,
  Zap,
  Globe,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Generate real-time data points
const generateRealtimePoint = () => ({
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
  rps: Math.floor(Math.random() * 500) + 200,
  human: Math.floor(Math.random() * 300) + 100,
  bot: Math.floor(Math.random() * 150) + 50,
  blocked: Math.floor(Math.random() * 50) + 10,
});

export default function RealTimeDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('real-time');
  const [activeTab, setActiveTab] = useState<'home' | 'application' | 'network' | 'data'>('application');
  const [realtimeData, setRealtimeData] = useState<ReturnType<typeof generateRealtimePoint>[]>([]);
  const [currentStats, setCurrentStats] = useState({
    rps: 0,
    human: 0,
    bot: 0,
    blocked: 0,
    activeConnections: 0,
  });
  const [isLive, setIsLive] = useState(true);

  // Initialize with some data points
  useEffect(() => {
    const initialData = Array.from({ length: 30 }, () => generateRealtimePoint());
    setRealtimeData(initialData);
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newPoint = generateRealtimePoint();
      setRealtimeData(prev => {
        const updated = [...prev.slice(-29), newPoint];
        return updated;
      });
      setCurrentStats({
        rps: newPoint.rps,
        human: newPoint.human,
        bot: newPoint.bot,
        blocked: newPoint.blocked,
        activeConnections: Math.floor(Math.random() * 2000) + 500,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="flex h-screen bg-imperva-bg-primary">
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

        {/* Breadcrumb & Live Toggle */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm text-imperva-blue hover:underline cursor-pointer">Home</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-imperva-blue hover:underline cursor-pointer">Application</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">Real-Time</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
              {isLive ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {/* Live Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Requests/sec</span>
                <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{currentStats.rps}</span>
                <span className="text-sm text-green-500 dark:text-green-400">
                  <TrendingUp className="w-3 h-3 inline" /> live
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Human Traffic</span>
                <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{currentStats.human}</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">/sec</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Bot Traffic</span>
                <Bot className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{currentStats.bot}</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">/sec</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Blocked</span>
                <ShieldOff className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-red-600 dark:text-red-400">{currentStats.blocked}</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">/sec</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Connections</span>
                <Globe className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600 dark:text-green-400">{currentStats.activeConnections.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Real-time Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500 dark:text-green-400" />
                Real-Time Traffic
                {isLive && <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-gray-500 dark:text-gray-400">Human</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-gray-500 dark:text-gray-400">Bot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-gray-500 dark:text-gray-400">Blocked</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="opacity-20 dark:opacity-100" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Area type="monotone" dataKey="human" stackId="1" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="bot" stackId="1" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="blocked" stackId="1" stroke="#F87171" fill="#F87171" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Distribution */}
          <div className="grid grid-cols-3 gap-6">
            {/* Human Traffic Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Human Traffic</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Desktop</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">62%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" style={{ width: '62%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Mobile</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-400 dark:bg-blue-300 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tablet</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">3%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-300 dark:bg-blue-200 h-2 rounded-full" style={{ width: '3%' }} />
                </div>
              </div>
            </div>

            {/* Bot Traffic Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Bot Traffic</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Good Bots</span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Bad Bots</span>
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">40%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 dark:bg-red-400 h-2 rounded-full" style={{ width: '40%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Unknown</span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">15%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>

            {/* Block Reasons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <ShieldOff className="w-5 h-5 text-red-500 dark:text-red-400" />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Block Reasons</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Bad Bot</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">52%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '52%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">WAF Rule</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">28%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '28%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Rate Limit</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
