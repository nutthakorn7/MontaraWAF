'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { DataTable, Toggle, Badge } from '@/components/ui';
import { Lock, Shield, Upload, CheckCircle, AlertCircle, Clock, Plus, RefreshCw, Trash2 } from 'lucide-react';

interface Certificate {
  id: number;
  domain: string;
  issuer: string;
  type: 'managed' | 'custom';
  status: 'active' | 'expiring' | 'expired';
  expiresAt: string;
  autoRenew: boolean;
}

const initialCerts: Certificate[] = [
  { id: 1, domain: '*.example.com', issuer: 'Let\'s Encrypt', type: 'managed', status: 'active', expiresAt: 'Mar 15, 2025', autoRenew: true },
  { id: 2, domain: 'api.example.com', issuer: 'DigiCert', type: 'custom', status: 'active', expiresAt: 'Dec 20, 2025', autoRenew: false },
  { id: 3, domain: 'shop.example.com', issuer: 'Let\'s Encrypt', type: 'managed', status: 'expiring', expiresAt: 'Jan 25, 2025', autoRenew: true },
  { id: 4, domain: 'old.example.com', issuer: 'Comodo', type: 'custom', status: 'expired', expiresAt: 'Dec 1, 2024', autoRenew: false },
];

export default function SSLTLSPage() {
  const [certs, setCerts] = useState<Certificate[]>(initialCerts);
  const [tlsVersion, setTlsVersion] = useState('1.3');
  const [hsts, setHsts] = useState(true);

  const handleRenew = (id: number) => {
    setCerts(certs.map(c => c.id === id ? { ...c, status: 'active' as const, expiresAt: 'Mar 15, 2026' } : c));
  };

  const handleDelete = (id: number) => {
    setCerts(certs.filter(c => c.id !== id));
  };

  const stats = {
    total: certs.length,
    active: certs.filter(c => c.status === 'active').length,
    expiring: certs.filter(c => c.status === 'expiring').length,
    expired: certs.filter(c => c.status === 'expired').length,
  };

  return (
    <AppLayout activeMenu="ssl-tls">
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Services</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">SSL/TLS</span>
        </div>
        <button className="btn-add">
          <Upload className="w-4 h-4" /> Upload Certificate
        </button>
      </div>

        <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Certificates</span>
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-green-600">{stats.active}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-yellow-600">{stats.expiring}</span>
            </div>
            <div className="card-container-padded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Expired</span>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-3xl font-bold text-red-600">{stats.expired}</span>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* TLS Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">TLS Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum TLS Version</label>
                  <select value={tlsVersion} onChange={e => setTlsVersion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="1.0">TLS 1.0</option>
                    <option value="1.1">TLS 1.1</option>
                    <option value="1.2">TLS 1.2</option>
                    <option value="1.3">TLS 1.3 (Recommended)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <Toggle 
                    checked={hsts}
                    onChange={setHsts}
                    label="HSTS"
                    description="HTTP Strict Transport Security"
                  />
                </div>
              </div>
            </div>

          {/* Security Grade */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">SSL Security Grade</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">A+</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Your SSL configuration meets the highest security standards.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">TLS 1.3 enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">HSTS enabled with preload</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Strong cipher suites only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">SSL Certificates</h3>
            </div>
            <DataTable<Certificate>
              keyField="id"
              data={certs}
              columns={[
                {
                  key: 'domain',
                  header: 'Domain',
                  render: (cert) => (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cert.domain}</span>
                    </div>
                  )
                },
                { key: 'issuer', header: 'Issuer' },
                {
                  key: 'type',
                  header: 'Type',
                  render: (cert) => (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cert.type === 'managed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {cert.type}
                    </span>
                  )
                },
                { key: 'expiresAt', header: 'Expires' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (cert) => (
                    <Badge 
                      variant={cert.status === 'active' ? 'success' : cert.status === 'expiring' ? 'warning' : 'error'}
                      size="sm"
                    >
                      {cert.status}
                    </Badge>
                  )
                },
                {
                  key: 'autoRenew',
                  header: 'Auto-Renew',
                  render: (cert) => cert.autoRenew ? <CheckCircle className="w-4 h-4 text-green-500" /> : <span className="text-gray-400">—</span>
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right' as const,
                  render: (cert) => (
                    <div className="flex justify-end gap-2">
                      {(cert.status === 'expiring' || cert.status === 'expired') && (
                        <button onClick={() => handleRenew(cert.id)} className="text-sm text-imperva-blue hover:underline">
                          <RefreshCw className="w-4 h-4 inline" /> Renew
                        </button>
                      )}
                      <button onClick={() => handleDelete(cert.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
