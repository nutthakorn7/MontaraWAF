'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { DataTable } from '@/components/ui';
import { 
  Trash2, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  Link,
  Tag,
  Layers
} from 'lucide-react';

interface PurgeHistory {
  id: number;
  type: 'url' | 'tag' | 'all';
  target: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  duration: string;
}

const purgeHistory: PurgeHistory[] = [
  { id: 1, type: 'url', target: 'https://example.com/assets/main.css', status: 'completed', timestamp: '2 min ago', duration: '1.2s' },
  { id: 2, type: 'tag', target: 'static-assets', status: 'completed', timestamp: '15 min ago', duration: '3.5s' },
  { id: 3, type: 'all', target: 'All cached content', status: 'completed', timestamp: '1 hour ago', duration: '45s' },
  { id: 4, type: 'url', target: 'https://example.com/api/config', status: 'pending', timestamp: '5 min ago', duration: '-' },
  { id: 5, type: 'tag', target: 'user-profiles', status: 'failed', timestamp: '2 hours ago', duration: '-' },
];

export default function PurgeCachePage() {
  const [purgeType, setPurgeType] = useState<'url' | 'tag' | 'all'>('url');
  const [purgeValue, setPurgeValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurge = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setPurgeValue('');
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <AppLayout>
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <div className="flex items-center gap-2">
            <span className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Edge</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Purge Cache</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Purge Form */}
          <div className="card-container-padded mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purge Cached Content</h3>
            
            {/* Purge Type Selection */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setPurgeType('url')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  purgeType === 'url' 
                    ? 'border-imperva-blue bg-blue-50 dark:bg-blue-900/20 text-imperva-blue' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Link className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">By URL</p>
                  <p className="text-xs opacity-70">Purge specific URLs</p>
                </div>
              </button>
              <button
                onClick={() => setPurgeType('tag')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  purgeType === 'tag' 
                    ? 'border-imperva-blue bg-blue-50 dark:bg-blue-900/20 text-imperva-blue' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Tag className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">By Tag</p>
                  <p className="text-xs opacity-70">Purge by cache tag</p>
                </div>
              </button>
              <button
                onClick={() => setPurgeType('all')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  purgeType === 'all' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Layers className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Purge All</p>
                  <p className="text-xs opacity-70">Clear entire cache</p>
                </div>
              </button>
            </div>

            {/* Input Field */}
            {purgeType !== 'all' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {purgeType === 'url' ? 'Enter URL(s) to purge' : 'Enter cache tag(s)'}
                </label>
                <textarea
                  value={purgeValue}
                  onChange={(e) => setPurgeValue(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-imperva-blue focus:border-transparent resize-none"
                  placeholder={purgeType === 'url' 
                    ? 'https://example.com/path/to/resource\nhttps://example.com/another/path' 
                    : 'static-assets\nuser-profiles\napi-responses'
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter one item per line</p>
              </div>
            )}

            {purgeType === 'all' && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Warning: This will purge all cached content</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This action will clear the entire cache across all edge locations. This may temporarily increase load on your origin server.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Cache purge request submitted successfully!</span>
                </div>
              </div>
            )}

            {/* Purge Button */}
            <button
              onClick={handlePurge}
              disabled={loading || (purgeType !== 'all' && !purgeValue.trim())}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                purgeType === 'all'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-imperva-blue text-white hover:bg-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              {loading ? 'Purging...' : 'Purge Cache'}
            </button>
          </div>

          {/* Purge History */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">Purge History</h3>
            </div>
            <DataTable<PurgeHistory>
              keyField="id"
              data={purgeHistory}
              columns={[
                {
                  key: 'type',
                  header: 'Type',
                  render: (item) => (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                      item.type === 'url' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      item.type === 'tag' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}>
                      {item.type === 'url' && <Link className="w-3 h-3" />}
                      {item.type === 'tag' && <Tag className="w-3 h-3" />}
                      {item.type === 'all' && <Layers className="w-3 h-3" />}
                      {item.type.toUpperCase()}
                    </span>
                  )
                },
                {
                  key: 'target',
                  header: 'Target',
                  render: (item) => <span className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate max-w-xs block">{item.target}</span>
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item) => (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      item.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      item.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {item.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {item.status === 'pending' && <Clock className="w-3 h-3 animate-spin" />}
                      {item.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  )
                },
                { key: 'duration', header: 'Duration' },
                { key: 'timestamp', header: 'Time' }
              ]}
            />
          </div>
        </main>
    </AppLayout>
  );
}
