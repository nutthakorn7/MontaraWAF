'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { DataTable, Badge } from '@/components/ui';
import { Shield, Code, AlertTriangle, CheckCircle, Eye, RefreshCw, ExternalLink } from 'lucide-react';

interface Script {
  id: number;
  name: string;
  domain: string;
  type: 'analytics' | 'advertising' | 'social' | 'utility' | 'unknown';
  status: 'approved' | 'blocked' | 'pending';
  risk: 'low' | 'medium' | 'high';
  lastSeen: string;
}

const scripts: Script[] = [
  { id: 1, name: 'Google Analytics', domain: 'google-analytics.com', type: 'analytics', status: 'approved', risk: 'low', lastSeen: '2 min ago' },
  { id: 2, name: 'Facebook Pixel', domain: 'connect.facebook.net', type: 'social', status: 'approved', risk: 'low', lastSeen: '5 min ago' },
  { id: 3, name: 'Hotjar', domain: 'static.hotjar.com', type: 'analytics', status: 'approved', risk: 'low', lastSeen: '10 min ago' },
  { id: 4, name: 'Unknown Script', domain: 'cdn.malicious.xyz', type: 'unknown', status: 'blocked', risk: 'high', lastSeen: '1 hour ago' },
  { id: 5, name: 'jQuery CDN', domain: 'code.jquery.com', type: 'utility', status: 'approved', risk: 'low', lastSeen: '1 min ago' },
  { id: 6, name: 'Suspicious Tracker', domain: 'track.suspicious.io', type: 'unknown', status: 'pending', risk: 'medium', lastSeen: '30 min ago' },
];

export default function ClientSideProtectionPage() {
  const [scriptList, setScriptList] = useState<Script[]>(scripts);
  const [scanning, setScanning] = useState(false);

  const handleApprove = (id: number) => {
    setScriptList(scriptList.map(s => s.id === id ? { ...s, status: 'approved' as const } : s));
  };

  const handleBlock = (id: number) => {
    setScriptList(scriptList.map(s => s.id === id ? { ...s, status: 'blocked' as const } : s));
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  const stats = {
    totalScripts: scriptList.length,
    approved: scriptList.filter(s => s.status === 'approved').length,
    blocked: scriptList.filter(s => s.status === 'blocked').length,
    pending: scriptList.filter(s => s.status === 'pending').length,
  };

  const typeColors = {
    analytics: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    advertising: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    social: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-400',
    utility: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  };

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };

  return (
    <AppLayout activeMenu="client-side">
      {/* Breadcrumb */}
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Client Protection</span>
        </div>
        <button onClick={handleScan} disabled={scanning}
          className="btn-add disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Client-Side Protection (CSP)</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Monitor and control third-party JavaScript running on your website. Prevent Magecart attacks, 
                  data skimming, and supply chain attacks by controlling which scripts can execute.
                </p>
              </div>
            </div>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Scripts</span>
                <Code className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalScripts}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Approved</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-green-600">{stats.approved}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Blocked</span>
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-3xl font-bold text-red-600">{stats.blocked}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Pending Review</span>
                <Eye className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
            </div>
          </div>

          {/* Scripts Table */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">Detected Scripts</h3>
              <p className="table-subtitle">Third-party scripts discovered on your pages</p>
            </div>
            <DataTable<Script>
              keyField="id"
              data={scriptList}
              columns={[
                {
                  key: 'name',
                  header: 'Script',
                  render: (script) => (
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{script.name}</span>
                    </div>
                  )
                },
                {
                  key: 'domain',
                  header: 'Domain',
                  render: (script) => (
                    <a href="#" className="text-sm text-imperva-blue hover:underline flex items-center gap-1">
                      {script.domain} <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                },
                {
                  key: 'type',
                  header: 'Type',
                  render: (script) => <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${typeColors[script.type]}`}>{script.type}</span>
                },
                {
                  key: 'risk',
                  header: 'Risk',
                  render: (script) => (
                    <span className={`text-sm font-medium capitalize ${riskColors[script.risk]}`}>
                      {script.risk === 'high' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {script.risk}
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (script) => (
                    <Badge 
                      variant={script.status === 'approved' ? 'success' : script.status === 'blocked' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {script.status}
                    </Badge>
                  )
                },
                { 
                  key: 'lastSeen', 
                  header: 'Last Seen',
                  render: (script) => <span className="text-sm text-gray-600 dark:text-gray-400">{script.lastSeen}</span>
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right' as const,
                  render: (script) => (
                    <div className="flex justify-end gap-2">
                      {script.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(script.id)} className="text-sm text-green-600 hover:underline">Approve</button>
                          <button onClick={() => handleBlock(script.id)} className="text-sm text-red-600 hover:underline">Block</button>
                        </>
                      )}
                      {script.status === 'approved' && (
                        <button onClick={() => handleBlock(script.id)} className="text-sm text-red-600 hover:underline">Block</button>
                      )}
                      {script.status === 'blocked' && (
                        <button onClick={() => handleApprove(script.id)} className="text-sm text-green-600 hover:underline">Approve</button>
                      )}
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

