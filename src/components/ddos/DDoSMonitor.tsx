'use client';

import { useState, useEffect } from 'react';

interface DDoSStats {
  status: 'protected' | 'under_attack';
  mitigationMode: string;
  layer7: {
    requestsPerSecond: number;
    requestsBlocked: number;
    requestsChallenged: number;
    activeThreats: number;
    topAttackTypes: { type: string; count: number }[];
  };
  layer34: {
    packetsBlocked: number;
    bandwidthSaved: string;
    topProtocols: { protocol: string; percentage: number }[];
  };
  topAttackers: { rank: number; ip: string; requestsPerSecond: number; status: string }[];
  blockedIPs: { ip: string; blockedUntil: string; remainingSeconds: number }[];
  config: {
    requestsPerSecond: number;
    burstSize: number;
    blockDuration: number;
  };
  protectionLevel: string;
  updatedAt: string;
}

export default function DDoSMonitor() {
  const [stats, setStats] = useState<DDoSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestHistory, setRequestHistory] = useState<number[]>([]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/v1/edge/ddos');
      const data = await res.json();
      setStats(data);
      setRequestHistory(prev => [...prev.slice(-29), data.layer7.requestsPerSecond]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch DDoS stats');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const maxReq = Math.max(...requestHistory, 10);

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <div className={`rounded-xl p-6 ${
        stats.status === 'under_attack' 
          ? 'bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/50' 
          : 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${
              stats.status === 'under_attack' ? 'bg-red-500 animate-pulse' : 'bg-green-500'
            }`} />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {stats.status === 'under_attack' ? '🚨 Under Attack' : '✅ Protected'}
              </h2>
              <p className="text-gray-300">
                Mode: <span className="font-semibold capitalize">{stats.mitigationMode}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{stats.layer7.requestsPerSecond}</p>
            <p className="text-gray-400">req/sec</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Requests Blocked" 
          value={stats.layer7.requestsBlocked.toLocaleString()} 
          color="red" 
        />
        <StatCard 
          title="Challenged" 
          value={stats.layer7.requestsChallenged.toLocaleString()} 
          color="yellow" 
        />
        <StatCard 
          title="Active Threats" 
          value={stats.layer7.activeThreats.toString()} 
          color="orange" 
        />
        <StatCard 
          title="Band Saved" 
          value={stats.layer34.bandwidthSaved} 
          color="blue" 
        />
      </div>

      {/* Traffic Graph */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Traffic (req/s)</h3>
        <div className="h-32 flex items-end gap-1">
          {requestHistory.map((req, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-300 ${
                req > stats.config.requestsPerSecond * 0.8 ? 'bg-red-500' :
                req > stats.config.requestsPerSecond * 0.5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ height: `${(req / maxReq) * 100}%`, minHeight: '4px' }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>-60s</span>
          <span>Now</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Attackers */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Attackers</h3>
          {stats.topAttackers.length > 0 ? (
            <div className="space-y-2">
              {stats.topAttackers.map((attacker) => (
                <div key={attacker.ip} className="flex items-center justify-between py-2 px-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">#{attacker.rank}</span>
                    <span className="text-white font-mono">{attacker.ip}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{attacker.requestsPerSecond} req/s</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      attacker.status === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {attacker.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active threats detected</p>
          )}
        </div>

        {/* Attack Types */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Attack Types</h3>
          <div className="space-y-3">
            {stats.layer7.topAttackTypes.map((attack) => (
              <div key={attack.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{attack.type}</span>
                  <span className="text-gray-400">{attack.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    style={{ width: `${Math.min((attack.count / (stats.layer7.requestsBlocked || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Config */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Protection Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          <ConfigItem label="Rate Limit" value={`${stats.config.requestsPerSecond} req/s`} />
          <ConfigItem label="Burst Size" value={stats.config.burstSize.toString()} />
          <ConfigItem label="Block Duration" value={`${stats.config.blockDuration}s`} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 border`}>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-700/30 rounded-lg p-3">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}
