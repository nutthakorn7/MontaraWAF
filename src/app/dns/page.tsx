'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Modal, Button, Input, Select, DataTable, Badge, ConfirmDialog, useToast } from '@/components/ui';
import { Globe, Plus, Edit2, Trash2, CheckCircle, RefreshCw, X, Save } from 'lucide-react';
import { apiClient, DNSRecord, CreateDNSRecordRequest } from '@/lib/api';

export default function DNSPage() {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DNSRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error: showError } = useToast();
  
  // Form State
  const [newRecord, setNewRecord] = useState<Partial<CreateDNSRecordRequest>>({
    type: 'A',
    name: '',
    content: '',
    ttl: 3600,
    proxied: true,
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listDNSRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch DNS records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDeleteClick = (record: DNSRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    
    setDeleting(true);
    try {
      await apiClient.deleteDNSRecord(recordToDelete.id);
      setRecords(records.filter(r => r.id !== recordToDelete.id));
      success('Record Deleted', `DNS record ${recordToDelete.name} has been deleted`);
    } catch (error) {
      console.error('Failed to delete record:', error);
      showError('Delete Failed', 'Could not delete the DNS record. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
    }
  };

  const handleAddRecord = async () => {
    try {
      const created = await apiClient.createDNSRecord(newRecord as CreateDNSRecordRequest);
      setRecords([...records, created]);
      setShowAddModal(false);
      setNewRecord({ type: 'A', name: '', content: '', ttl: 3600, proxied: true });
      success('Record Created', `DNS record ${newRecord.name} has been created`);
    } catch (error) {
      console.error('Failed to create record:', error);
      showError('Create Failed', 'Could not create the DNS record. Please try again.');
    }
  };

  return (
    <AppLayout activeMenu="dns">
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Edge</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">DNS</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchRecords}
            className="btn-ghost"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-add">
            <Plus className="w-4 h-4" />Add Record
          </button>
        </div>
      </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="card-container-padded mb-6">
            <div className="flex items-center gap-4">
              <Globe className="w-10 h-10 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">example.com</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Managed DNS Zone</p>
              </div>
            </div>
          </div>
          
          {loading && records.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
            </div>
          ) : (
            <div className="table-container">
              <div className="table-header">
                <h3 className="table-title">DNS Records</h3>
              </div>
              <DataTable<DNSRecord>
                keyField="id"
                data={records}
                emptyMessage="No DNS records found"
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    render: (r) => <span className="font-mono text-sm">{r.name}</span>
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    render: (r) => (
                      <Badge 
                        variant={r.type === 'A' ? 'info' : r.type === 'CNAME' ? 'purple' : r.type === 'MX' ? 'success' : r.type === 'TXT' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {r.type}
                      </Badge>
                    )
                  },
                  {
                    key: 'content',
                    header: 'Content',
                    render: (r) => (
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{r.content}</code>
                    )
                  },
                  {
                    key: 'ttl',
                    header: 'TTL',
                    render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.ttl}s</span>
                  },
                  {
                    key: 'proxied',
                    header: 'Proxy Status',
                    render: (r) => (
                      <span className={`flex items-center gap-1 text-xs ${r.proxied ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Globe className="w-3 h-3" />
                        {r.proxied ? 'Proxied' : 'DNS Only'}
                      </span>
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    align: 'right' as const,
                    render: (r) => (
                      <div className="flex justify-end gap-2">
                        <button className="text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteClick(r)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          )}
        </main>

      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add DNS Record"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Type"
            value={newRecord.type}
            onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
            options={[
              { value: 'A', label: 'A' },
              { value: 'AAAA', label: 'AAAA' },
              { value: 'CNAME', label: 'CNAME' },
              { value: 'MX', label: 'MX' },
              { value: 'TXT', label: 'TXT' },
              { value: 'NS', label: 'NS' },
            ]}
          />
          <Input
            label="Name"
            value={newRecord.name}
            onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
            placeholder="@ for root, or subdomain"
          />
          <Input
            label="Content (IP or Domain)"
            value={newRecord.content}
            onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
            placeholder="192.0.2.1"
          />
          <Select
            label="TTL"
            value={newRecord.ttl?.toString()}
            onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
            options={[
              { value: '60', label: '1 min' },
              { value: '300', label: '5 min' },
              { value: '3600', label: '1 hour' },
              { value: '86400', label: '1 day' },
            ]}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="proxied"
              checked={newRecord.proxied}
              onChange={(e) => setNewRecord({ ...newRecord, proxied: e.target.checked })}
              className="w-4 h-4 text-imperva-blue rounded"
            />
            <label htmlFor="proxied" className="text-sm font-medium text-gray-700 dark:text-gray-300">Proxy Status (CDN)</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleAddRecord}
            icon={<Save className="w-4 h-4" />}
          >
            Save Record
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setRecordToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete DNS Record"
        message={`Are you sure you want to delete the DNS record "${recordToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Record"
        cancelLabel="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </AppLayout>
  );
}
