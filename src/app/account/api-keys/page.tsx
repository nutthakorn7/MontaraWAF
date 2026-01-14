'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { Modal, Button, Input, StatCard, DataTable, Badge } from '@/components/ui';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface APIKey {
  id: number;
  name: string;
  keyPrefix: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const initialKeys: APIKey[] = [
  { id: 1, name: 'Production API', keyPrefix: 'imp_live_****3f2d', permissions: ['read', 'write'], createdAt: 'Jan 15, 2024', lastUsed: '2 min ago', status: 'active' },
  { id: 2, name: 'Monitoring', keyPrefix: 'imp_live_****8a1b', permissions: ['read'], createdAt: 'Feb 20, 2024', lastUsed: '1 hour ago', status: 'active' },
  { id: 3, name: 'CI/CD Pipeline', keyPrefix: 'imp_live_****c5e7', permissions: ['read', 'write', 'delete'], createdAt: 'Mar 5, 2024', lastUsed: '5 min ago', status: 'active' },
  { id: 4, name: 'Old Integration', keyPrefix: 'imp_test_****d9f4', permissions: ['read'], createdAt: 'Dec 1, 2023', lastUsed: 'Never', status: 'revoked' },
];

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>(initialKeys);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(['read']);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = () => {
    const newKey = `imp_live_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(newKey);
    
    const newId = Math.max(...keys.map(k => k.id)) + 1;
    setKeys([...keys, {
      id: newId,
      name: newKeyName,
      keyPrefix: `imp_live_****${newKey.slice(-4)}`,
      permissions: newKeyPerms,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      status: 'active'
    }]);
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = (id: number) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setGeneratedKey(null);
    setNewKeyName('');
    setNewKeyPerms(['read']);
  };

  return (
    <AppLayout activeMenu="api-keys">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account' },
          { label: 'API Keys' }
        ]}
        actions={
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Generate API Key
          </Button>
        }
      />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">API Key Security</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  API keys provide programmatic access to your account. Keep them secure and never share them publicly. 
                  You can revoke keys at any time if they are compromised.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Total Keys" 
              value={keys.length} 
              icon={<Key className="w-5 h-5" />} 
              color="blue" 
            />
            <StatCard 
              title="Active" 
              value={keys.filter(k => k.status === 'active').length} 
              icon={<CheckCircle className="w-5 h-5" />} 
              color="green" 
            />
            <StatCard 
              title="Revoked" 
              value={keys.filter(k => k.status === 'revoked').length} 
              icon={<AlertTriangle className="w-5 h-5" />} 
              color="red" 
            />
          </div>

          {/* Keys Table */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">API Keys</h3>
            </div>
            <DataTable<APIKey>
              keyField="id"
              data={keys}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  render: (key) => (
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{key.name}</span>
                  )
                },
                {
                  key: 'keyPrefix',
                  header: 'Key',
                  render: (key) => (
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{key.keyPrefix}</code>
                  )
                },
                {
                  key: 'permissions',
                  header: 'Permissions',
                  render: (key) => (
                    <div className="flex gap-1">
                      {key.permissions.map(p => (
                        <span key={p} className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{p}</span>
                      ))}
                    </div>
                  )
                },
                { key: 'createdAt', header: 'Created' },
                { key: 'lastUsed', header: 'Last Used' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (key) => (
                    <Badge variant={key.status === 'active' ? 'success' : 'error'} size="sm">
                      {key.status}
                    </Badge>
                  )
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right' as const,
                  render: (key) => (
                    key.status === 'active' ? (
                      <button 
                        onClick={() => handleRevoke(key.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Revoke
                      </button>
                    ) : null
                  )
                }
              ]}
            />
          </div>
        </main>

      <Modal 
        isOpen={showAddModal} 
        onClose={handleCloseModal}
        title={generatedKey ? 'API Key Generated' : 'Generate API Key'}
        size="md"
      >
        {!generatedKey ? (
          <div className="space-y-4">
            <Input
              label="Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
              <div className="space-y-2">
                {['read', 'write', 'delete'].map(perm => (
                  <label key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newKeyPerms.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyPerms([...newKeyPerms, perm]);
                        } else {
                          setNewKeyPerms(newKeyPerms.filter(p => p !== perm));
                        }
                      }}
                      className="rounded border-gray-300 text-imperva-blue focus:ring-imperva-blue"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateKey}
              disabled={!newKeyName.trim()}
              icon={<Key className="w-4 h-4" />}
              className="w-full"
            >
              Generate Key
            </Button>
          </div>
        ) : (
          <div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Make sure to copy your API key now. You won&apos;t be able to see it again!
                </p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <code className="text-sm text-gray-900 dark:text-gray-100 break-all">{generatedKey}</code>
              <button
                onClick={handleCopy}
                className="ml-3 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <Button
              variant="primary"
              onClick={handleCloseModal}
              className="w-full mt-4"
            >
              Done
            </Button>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
