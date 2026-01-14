'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { DataTable, ConfirmDialog, useToast } from '@/components/ui';
import { Activity, Globe, AlertTriangle, TrendingUp, Shield, Ban, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const threatCategories = [
  { name: 'Malicious IPs', value: 2340, color: '#EF4444' },
  { name: 'Spam Sources', value: 1560, color: '#F59E0B' },
  { name: 'Tor Exit Nodes', value: 890, color: '#8B5CF6' },
  { name: 'Botnets', value: 670, color: '#3B82F6' },
  { name: 'Scanners', value: 450, color: '#10B981' },
];

const reputationByCountry = [
  { country: 'China', threats: 8500 },
  { country: 'Russia', threats: 6200 },
  { country: 'USA', threats: 4100 },
  { country: 'Brazil', threats: 2800 },
  { country: 'India', threats: 2100 },
];

const blockedIPs = [
  { ip: '45.33.32.156', category: 'Malicious', reputation: 'Critical', country: 'CN', lastSeen: '1 min ago' },
  { ip: '185.220.101.45', category: 'Tor Exit', reputation: 'High', country: 'DE', lastSeen: '3 min ago' },
  { ip: '91.134.232.89', category: 'Botnet', reputation: 'Critical', country: 'RU', lastSeen: '5 min ago' },
  { ip: '162.247.74.202', category: 'Scanner', reputation: 'Medium', country: 'US', lastSeen: '8 min ago' },
];

export default function ReputationPage() {
  const { info, success } = useToast();
  const [showWhitelistConfirm, setShowWhitelistConfirm] = useState(false);
  const [ipToWhitelist, setIpToWhitelist] = useState<string | null>(null);

  const getReputationColor = (rep: string) => {
    switch (rep) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AppLayout activeMenu="reputation">
      <div className="breadcrumb-container">
        <div className="flex items-center gap-2 mb-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Reputation</span>
        </div>
        <h1 className="page-title text-xl flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-500" />
          Reputation Intelligence
        </h1>
        <p className="page-subtitle mt-1">Monitor IP reputation and threat intelligence feeds</p>
      </div>

        <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-container-padded">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Blocked IPs</p>
              <p className="text-2xl font-bold text-red-600">12,847</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">From reputation feeds</p>
            </div>
            <div className="card-container-padded">
              <p className="text-sm text-gray-500 dark:text-gray-400">Threat Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active categories</p>
            </div>
            <div className="card-container-padded">
              <p className="text-sm text-gray-500 dark:text-gray-400">Feeds Updated</p>
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last updated 5 min ago</p>
            </div>
            <div className="card-container-padded">
              <p className="text-sm text-gray-500 dark:text-gray-400">Blocks Today</p>
              <p className="text-2xl font-bold text-imperva-blue">3,421</p>
              <p className="text-xs text-green-500 mt-1">+15% from yesterday</p>
            </div>
          </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card-container-padded">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Threats by Country</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reputationByCountry} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={60} />
                    <Tooltip />
                    <Bar dataKey="threats" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Threat Categories</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={threatCategories} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {threatCategories.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {threatCategories.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="ml-auto font-medium text-gray-900 dark:text-white">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocked IPs Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recently Blocked IPs</h3>
            </div>
            <DataTable
              keyField="ip"
              data={blockedIPs}
              columns={[
                { key: 'ip', header: 'IP Address', render: (row) => <span className="font-mono text-sm">{row.ip}</span> },
                { key: 'category', header: 'Category' },
                {
                  key: 'reputation',
                  header: 'Reputation',
                  render: (row) => <span className={`px-2 py-1 rounded text-xs font-medium ${getReputationColor(row.reputation)}`}>{row.reputation}</span>
                },
                { key: 'country', header: 'Country' },
                { key: 'lastSeen', header: 'Last Seen' },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => info('IP Details', `Viewing details for IP: ${row.ip}`)}
                        className="p-1 text-gray-400 hover:text-imperva-blue transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setIpToWhitelist(row.ip);
                          setShowWhitelistConfirm(true);
                        }}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Whitelist IP"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </main>

      {/* Whitelist Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWhitelistConfirm}
        onClose={() => { setShowWhitelistConfirm(false); setIpToWhitelist(null); }}
        onConfirm={() => {
          success('IP Whitelisted', `IP ${ipToWhitelist} added to whitelist`);
          setShowWhitelistConfirm(false);
          setIpToWhitelist(null);
        }}
        title="Whitelist IP"
        message={`Are you sure you want to add ${ipToWhitelist} to the whitelist? This IP will no longer be blocked.`}
        confirmLabel="Add to Whitelist"
        cancelLabel="Cancel"
        variant="default"
      />
    </AppLayout>
  );
}
