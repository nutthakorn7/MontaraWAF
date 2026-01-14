'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Brain, Shield, Bot, Settings, TrendingUp, AlertTriangle, RefreshCw, Check, X } from 'lucide-react';

interface AIStats {
  anomalyDetection: { totalRequests: number; uniqueIPs: number; anomaliesDetected: number; anomalyRate: number };
  botClassifier: { totalClassifications: number; humanCount: number; badBotCount: number; goodBotCount: number };
  autoTuning: { totalRules: number; overallAccuracy: number; rulesNeedingReview: number; autoTuneEnabled: boolean };
}

export default function AISecurityPage() {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'anomaly' | 'bot' | 'tuning'>('overview');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/v1/ai');
      const data = await res.json();
      setStats(data.services);
    } catch (error) {
      console.error('Failed to fetch AI stats');
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <AppLayout activeMenu="ai-security">
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeMenu="ai-security">
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">AI Security</span>
        </div>
        <button onClick={fetchStats} className="btn-ghost">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30 mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">AI Security</h1>
              <p className="text-purple-200">Machine learning powered threat detection</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Anomalies Detected</span>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.anomalyDetection.anomaliesDetected}</span>
            <p className="text-xs text-gray-500">{stats.anomalyDetection.anomalyRate}% of traffic</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Bots Classified</span>
              <Bot className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.botClassifier.totalClassifications}</span>
            <p className="text-xs text-gray-500">{stats.botClassifier.badBotCount} bad, {stats.botClassifier.humanCount} human</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Rule Accuracy</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.autoTuning.overallAccuracy}%</span>
            <p className="text-xs text-gray-500">{stats.autoTuning.totalRules} rules active</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Auto-tuning</span>
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <span className={`text-2xl font-bold ${stats.autoTuning.autoTuneEnabled ? 'text-green-400' : 'text-gray-400'}`}>
              {stats.autoTuning.autoTuneEnabled ? 'Active' : 'Disabled'}
            </span>
            <p className="text-xs text-gray-500">{stats.autoTuning.rulesNeedingReview} need review</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'anomaly', 'bot', 'tuning'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab === 'anomaly' ? 'Anomaly Detection' : tab === 'bot' ? 'Bot Classifier' : tab === 'tuning' ? 'Auto-tuning' : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Anomaly Detection */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-white">Anomaly Detection</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Requests</span>
                  <span className="text-white">{stats.anomalyDetection.totalRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Unique IPs</span>
                  <span className="text-white">{stats.anomalyDetection.uniqueIPs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Anomalies</span>
                  <span className="text-yellow-400">{stats.anomalyDetection.anomaliesDetected}</span>
                </div>
              </div>
            </div>

            {/* Bot Classifier */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">Bot Classifier</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Humans</span>
                  <span className="text-green-400">{stats.botClassifier.humanCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Good Bots</span>
                  <span className="text-blue-400">{stats.botClassifier.goodBotCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bad Bots</span>
                  <span className="text-red-400">{stats.botClassifier.badBotCount}</span>
                </div>
              </div>
            </div>

            {/* Auto-tuning */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">Auto-tuning</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rules</span>
                  <span className="text-white">{stats.autoTuning.totalRules}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-green-400">{stats.autoTuning.overallAccuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Need Review</span>
                  <span className="text-yellow-400">{stats.autoTuning.rulesNeedingReview}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-center py-8">
              Detailed {activeTab} view coming soon...
            </p>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
