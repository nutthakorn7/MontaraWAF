'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { Button, StatCard, DataTable, Badge } from '@/components/ui';
import { 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  TestTube,
  Download,
  CheckCircle,
  AlertCircle,
  Save,
  Server
} from 'lucide-react';

interface SIEMIntegration {
  id: number;
  name: string;
  type: 'splunk' | 's3' | 'elasticsearch' | 'syslog';
  destination: string;
  format: 'json' | 'cef' | 'leef';
  status: 'connected' | 'error' | 'disabled';
  lastSync: string;
}

const initialIntegrations: SIEMIntegration[] = [
  { id: 1, name: 'Production Splunk', type: 'splunk', destination: 'https://splunk.company.com:8088', format: 'json', status: 'connected', lastSync: '2 min ago' },
  { id: 2, name: 'AWS S3 Archive', type: 's3', destination: 's3://security-logs-bucket', format: 'json', status: 'connected', lastSync: '5 min ago' },
  { id: 3, name: 'Elasticsearch Cluster', type: 'elasticsearch', destination: 'https://es.internal:9200', format: 'json', status: 'error', lastSync: '1 hour ago' },
];

export default function SIEMLogsPage() {
  const [integrations, setIntegrations] = useState<SIEMIntegration[]>(initialIntegrations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

  const handleTest = (id: number) => {
    setTestingId(id);
    setTimeout(() => {
      setIntegrations(integrations.map(i => 
        i.id === id ? { ...i, status: 'connected' as const, lastSync: 'Just now' } : i
      ));
      setTestingId(null);
    }, 2000);
  };

  const handleDelete = (id: number) => {
    setIntegrations(integrations.filter(i => i.id !== id));
  };

  const typeIcons = {
    splunk: '🔍',
    s3: '☁️',
    elasticsearch: '🔎',
    syslog: '📝',
  };

  return (
    <AppLayout activeMenu="siem">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account' },
          { label: 'SIEM Logs' }
        ]}
        actions={
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Integration
          </Button>
        }
      />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Integrations" 
              value={integrations.length} 
              icon={<Database className="w-5 h-5" />} 
              color="blue" 
            />
            <StatCard 
              title="Connected" 
              value={integrations.filter(i => i.status === 'connected').length} 
              icon={<CheckCircle className="w-5 h-5" />} 
              color="green" 
            />
            <StatCard 
              title="Errors" 
              value={integrations.filter(i => i.status === 'error').length} 
              icon={<AlertCircle className="w-5 h-5" />} 
              color="red" 
            />
            <StatCard 
              title="Logs Today" 
              value="1.2M" 
              icon={<Server className="w-5 h-5" />} 
              color="purple" 
            />
          </div>

          {/* Log Formats Info */}
          <div className="card-container-padded mb-6">
            <h3 className="table-title mb-4">Supported Log Formats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">JSON</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Structured JSON format with full event details</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">CEF</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Common Event Format for ArcSight compatibility</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">LEEF</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Log Event Extended Format for QRadar</p>
              </div>
            </div>
          </div>

          {/* Integrations Table */}
          <div className="table-container">
            <div className="table-header flex items-center justify-between">
              <h3 className="table-title">SIEM Integrations</h3>
              <button className="flex items-center gap-1.5 text-sm text-imperva-blue hover:underline">
                <Download className="w-4 h-4" />
                Download Sample Logs
              </button>
            </div>
            <DataTable<SIEMIntegration>
              keyField="id"
              data={integrations}
              columns={[
                {
                  key: 'name',
                  header: 'Integration',
                  render: (integration) => (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeIcons[integration.type]}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{integration.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{integration.type}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'destination',
                  header: 'Destination',
                  render: (integration) => (
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{integration.destination}</code>
                  )
                },
                {
                  key: 'format',
                  header: 'Format',
                  render: (integration) => (
                    <span className="text-sm text-gray-600 dark:text-gray-400 uppercase">{integration.format}</span>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (integration) => (
                    <Badge 
                      variant={integration.status === 'connected' ? 'success' : integration.status === 'error' ? 'error' : 'default'}
                      size="sm"
                      icon={integration.status === 'connected' ? <CheckCircle className="w-3 h-3" /> : integration.status === 'error' ? <AlertCircle className="w-3 h-3" /> : undefined}
                    >
                      {integration.status}
                    </Badge>
                  )
                },
                { key: 'lastSync', header: 'Last Sync' },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right' as const,
                  render: (integration) => (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleTest(integration.id)}
                        disabled={testingId === integration.id}
                        className="text-sm text-imperva-blue hover:underline"
                      >
                        {testingId === integration.id ? 'Testing...' : 'Test'}
                      </button>
                      <button className="text-gray-400 hover:text-blue-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(integration.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
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
