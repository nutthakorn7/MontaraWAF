'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, Key, Activity, Plus, Trash2, RefreshCw, Eye, EyeOff, Copy } from 'lucide-react';

interface EndpointConfig {
  path: string;
  method: string;
  rateLimit: number;
  burstSize: number;
  requiresAuth: boolean;
  enabled: boolean;
  hitCount: number;
}

interface APIKey {
  id: string;
  key: string;
  name: string;
  scopes: string[];
  rateLimit: number;
  enabled: boolean;
  usageCount: number;
}

export default function APIProtectionPage() {
  const [stats, setStats] = useState<any>(null);
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'keys'>('overview');
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [mainRes, endpointsRes, keysRes] = await Promise.all([
        fetch('/api/v1/security/api-protection'),
        fetch('/api/v1/security/api-protection?action=endpoints'),
        fetch('/api/v1/security/api-protection?action=keys'),
      ]);
      
      setStats(await mainRes.json());
      const ep = await endpointsRes.json();
      setEndpoints(ep.endpoints || []);
      const k = await keysRes.json();
      setApiKeys(k.keys || []);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function createAPIKey(name: string, scopes: string[]) {
    try {
      const res = await fetch('/api/v1/security/api-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_key', name, scopes }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKey(data.key);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create API key');
    }
  }

  async function deleteAPIKey(id: string) {
    if (!confirm('Delete this API key?')) return;
    try {
      await fetch(`/api/v1/security/api-protection?keyId=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete API key');
    }
  }

  if (loading) {
    return (
      <AppLayout activeMenu="api-protection">
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeMenu="api-protection">
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">API Protection</span>
        </div>
        <button onClick={fetchData} className="btn-ghost">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Protected Endpoints</span>
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats?.stats?.protectedEndpoints || 0}</span>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active API Keys</span>
              <Key className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats?.stats?.activeAPIKeys || 0}</span>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Requests/Hour</span>
              <Activity className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats?.stats?.requestsLastHour || 0}</span>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Endpoints</span>
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats?.stats?.totalEndpoints || 0}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'endpoints', 'keys'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab === 'keys' ? 'API Keys' : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
              <div className="space-y-3">
                {Object.entries(stats?.features || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'}`}>
                      {value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('keys')}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Key className="w-4 h-4" /> Create API Key
                </button>
                <button
                  onClick={() => setActiveTab('endpoints')}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Manage Endpoints
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Protected Endpoints</h3>
              <button className="btn-add text-sm" onClick={() => setShowAddEndpoint(true)}>
                <Plus className="w-4 h-4" /> Add Endpoint
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Path</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rate Limit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Auth</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Hits</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-white font-mono text-sm">{ep.path}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{ep.method}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{ep.rateLimit} req/s</td>
                    <td className="px-4 py-3">
                      {ep.requiresAuth ? (
                        <span className="text-yellow-400">Required</span>
                      ) : (
                        <span className="text-gray-500">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{ep.hitCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${ep.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'}`}>
                        {ep.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* New key notification */}
            {newKey && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 font-medium">New API Key Created!</p>
                    <p className="text-green-300 font-mono text-sm mt-1">{newKey}</p>
                    <p className="text-green-400/60 text-xs mt-1">Save this key now. You won't be able to see it again.</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(newKey); }}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded"
                  >
                    <Copy className="w-4 h-4 text-green-400" />
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">API Keys</h3>
                <button
                  className="btn-add text-sm"
                  onClick={() => createAPIKey('New Key', ['read', 'write'])}
                >
                  <Plus className="w-4 h-4" /> Create Key
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Key</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Scopes</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rate Limit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Usage</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-white">{key.name}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-sm">{key.key}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {key.scopes.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{key.rateLimit} req/s</td>
                      <td className="px-4 py-3 text-gray-400">{key.usageCount}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteAPIKey(key.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
