'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Modal, Button, Input, DataTable, ConfirmDialog, useToast } from '@/components/ui';
import { Shield, Plus, Trash2, Globe, CheckCircle, X, Save, RefreshCw } from 'lucide-react';
import { apiClient, IPRule, CreateIPRuleRequest } from '@/lib/api';

const blockedCountries = ['CN', 'RU', 'KP', 'IR'];

export default function IPManagementPage() {
  const [rules, setRules] = useState<IPRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListTab, setActiveListTab] = useState<'whitelist' | 'blacklist' | 'geo'>('whitelist');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({ ip: '', reason: '' });
  
  // Confirm dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<IPRule | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Toast notifications
  const { success, error: showError } = useToast();

  // Mock data fallback
  const getMockIPRules = (): IPRule[] => [
    {
      id: '1',
      ip: '192.168.1.100',
      type: 'whitelist',
      reason: 'Office network - trusted',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      ip: '10.0.0.0/8',
      type: 'whitelist',
      reason: 'Internal network range',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      ip: '203.0.113.50',
      type: 'whitelist',
      reason: 'Partner API server',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      ip: '45.33.32.156',
      type: 'blacklist',
      reason: 'Known malicious scanner',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      ip: '185.220.101.0/24',
      type: 'blacklist',
      reason: 'Tor exit nodes range',
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      ip: '91.240.118.0/24',
      type: 'blacklist',
      reason: 'Botnet C2 infrastructure',
      created_at: new Date().toISOString(),
    },
  ];

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listIPRules();
      if (data && data.length > 0) {
        setRules(data);
      } else {
        // Use mock data if API returns empty
        setRules(getMockIPRules());
      }
    } catch (error) {
      console.error('Failed to fetch IP rules:', error);
      // Fallback to mock data
      setRules(getMockIPRules());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeListTab !== 'geo') {
      fetchRules();
    }
  }, [activeListTab]);

  const handleAdd = async () => {
    try {
      const created = await apiClient.createIPRule({
        ...newRule,
        type: activeListTab,
      } as CreateIPRuleRequest);
      setRules([created, ...rules]);
      setShowAddModal(false);
      setNewRule({ ip: '', reason: '' });
      success('IP Added', `${newRule.ip} has been added to ${activeListTab}`);
    } catch (error) {
      console.error('Failed to create IP rule:', error);
      showError('Failed to Add', 'Could not add the IP rule. Please try again.');
    }
  };

  const handleDeleteClick = (rule: IPRule) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;
    
    setDeleting(true);
    try {
      await apiClient.deleteIPRule(ruleToDelete.id);
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      success('IP Removed', `${ruleToDelete.ip} has been removed from the list`);
    } catch (error) {
      console.error('Failed to delete rule:', error);
      showError('Delete Failed', 'Could not delete the IP rule. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };



  const filteredRules = rules.filter(r => r.type === activeListTab);

  return (
    <AppLayout activeMenu="ip-management">
      {/* Breadcrumb */}
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">IP Management</span>
        </div>
        <div className="flex items-center gap-2">
           {activeListTab !== 'geo' && (
            <>
               <button 
                onClick={fetchRules}
                className="btn-ghost"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-add">
                <Plus className="w-4 h-4" />Add IP
              </button>
            </>
          )}
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card-container-padded">
            <span className="text-sm text-gray-500 dark:text-gray-400">Whitelisted IPs</span>
            <p className="text-3xl font-bold text-green-600 mt-1">{rules.filter(r => r.type === 'whitelist').length}</p>
          </div>
          <div className="card-container-padded">
            <span className="text-sm text-gray-500 dark:text-gray-400">Blacklisted IPs</span>
            <p className="text-3xl font-bold text-red-600 mt-1">{rules.filter(r => r.type === 'blacklist').length}</p>
          </div>
          <div className="card-container-padded">
            <span className="text-sm text-gray-500 dark:text-gray-400">Blocked Countries</span>
            <p className="text-3xl font-bold text-orange-600 mt-1">{blockedCountries.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['whitelist', 'blacklist', 'geo'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveListTab(tab)}
              className={`tab-btn ${
                activeListTab === tab 
                  ? 'tab-btn-active' 
                  : 'tab-btn-inactive'
              }`}>
              {tab === 'whitelist' ? '✅ Whitelist' : tab === 'blacklist' ? '🚫 Blacklist' : '🌍 Geo-blocking'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeListTab !== 'geo' ? (
           <>
           {loading && filteredRules.length === 0 ? (
              <div className="flex justify-center items-center h-64 card-container">
                <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
              </div>
           ) : (
              <div className="table-container">
                <DataTable<IPRule>
                  keyField="id"
                  data={filteredRules}
                  emptyMessage={`No IPs in ${activeListTab}`}
                  columns={[
                    {
                      key: 'ip',
                      header: 'IP/CIDR',
                      render: (r) => <span className="font-mono text-sm text-gray-900 dark:text-white">{r.ip}</span>
                    },
                    {
                      key: 'reason',
                      header: 'Reason',
                      render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.reason}</span>
                    },
                    {
                      key: 'created_at',
                      header: 'Added',
                      render: (r) => <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      align: 'right' as const,
                      render: (r) => (
                        <button onClick={() => handleDeleteClick(r)} className="action-btn-danger">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    }
                  ]}
                />
              </div>
           )}
           </>
        ) : (
          <div className="card-container-padded">
            <h3 className="table-title mb-4">Blocked Countries</h3>
            <div className="flex flex-wrap gap-2">
              {blockedCountries.map(c => (
                <span key={c} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm font-medium">{c}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">All traffic from these countries will be blocked.</p>
          </div>
        )}
      </main>

    {showAddModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">Add to {activeListTab}</h3>
            <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP or CIDR</label>
              <input type="text" value={newRule.ip} onChange={e => setNewRule({ ...newRule, ip: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="192.168.1.1 or 10.0.0.0/8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
              <input type="text" value={newRule.reason} onChange={e => setNewRule({ ...newRule, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Why this IP?" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm text-white bg-imperva-blue rounded-lg">Add</button>
          </div>
        </div>
      </div>
    )}

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      onClose={() => { setShowDeleteConfirm(false); setRuleToDelete(null); }}
      onConfirm={handleDeleteConfirm}
      title="Delete IP Rule"
      message={`Are you sure you want to remove "${ruleToDelete?.ip}" from the ${activeListTab}? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      loading={deleting}
    />
  </AppLayout>
  );
}
