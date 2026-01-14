'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Toggle, Badge } from '@/components/ui';
import { Bot, Shield, Eye, Zap, Settings, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiClient, BotStats, BotSettings } from '@/lib/api';

export default function BotProtectionPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, settingsData] = await Promise.all([
        apiClient.getBotStats(),
        apiClient.getBotSettings()
      ]);
      setStats(statsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch bot data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettingChange = async (key: keyof BotSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaving(true);
    try {
      await apiClient.updateBotSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !stats || !settings) {
    return (
      <AppLayout activeMenu="bot-protection">
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeMenu="bot-protection">
      {/* Breadcrumb */}
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Bot Protection</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Saving...</span>}
          <button onClick={fetchData} className="btn-ghost">
             <RefreshCw className="w-4 h-4" />
          </button>
          <button className="btn-add">
            <Settings className="w-4 h-4" /> Configure
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Bot Traffic</span>
                <Bot className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_bots}</span>
                <span className={`text-sm flex items-center ${stats.bot_change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {stats.bot_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stats.bot_change)}%
                </span>
              </div>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Bad Bots Blocked</span>
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">{stats.bad_bots_blocked}</span>
                <span className="text-sm text-green-500 flex items-center">
                  <TrendingUp className="w-3 h-3" />+{stats.blocked_change}%
                </span>
              </div>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Challenges Solved</span>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-yellow-600">{stats.challenges_solved}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Human Verified</span>
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-green-600">{stats.human_verified}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Bot Traffic Distribution */}
            <div className="card-container-padded">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bot Traffic Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.traffic_data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {stats.traffic_data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {stats.traffic_data.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card col-span-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Weekly Bot Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weekly_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip />
                    <Bar dataKey="good" fill="#10B981" name="Good Bots" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bad" fill="#EF4444" name="Bad Bots" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Detection Settings */}
            <div className="card-container-padded">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Detection Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sensitivity Level</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(level => (
                      <button key={level} onClick={() => handleSettingChange('sensitivity', level)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                          settings.sensitivity === level 
                            ? 'bg-imperva-blue text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}>{level}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <Toggle 
                    checked={settings.js_challenge}
                    onChange={(checked) => handleSettingChange('js_challenge', checked)}
                    label="JavaScript Challenge"
                    description="Verify browser capabilities"
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <Toggle 
                    checked={settings.captcha}
                    onChange={(checked) => handleSettingChange('captcha', checked)}
                    label="CAPTCHA"
                    description="Human verification for suspicious traffic"
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <Toggle 
                    checked={settings.device_fingerprint}
                    onChange={(checked) => handleSettingChange('device_fingerprint', checked)}
                    label="Device Fingerprinting"
                    description="Track device characteristics"
                  />
                </div>
              </div>
            </div>

            {/* Bot Types */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bot Types Detected</h3>
              <div className="space-y-3">
                {stats.bot_types.map((bot, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <Bot className={`w-4 h-4 ${bot.status === 'blocked' ? 'text-red-500' : 'text-green-500'}`} />
                      <span className="text-sm text-gray-900 dark:text-white">{bot.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{bot.count.toLocaleString()}</span>
                      <Badge variant={bot.status === 'blocked' ? 'error' : 'success'} size="sm">
                        {bot.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
    </AppLayout>
  );
}

