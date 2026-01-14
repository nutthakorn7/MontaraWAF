'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { Modal, Button, Input, Select, DataTable, Badge, ConfirmDialog, useToast } from '@/components/ui';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  RefreshCw,
  HardDrive,
  Clock,
  Globe
} from 'lucide-react';
import { apiClient, CachingRule, CreateCachingRuleRequest } from '@/lib/api';

export default function CachingRulesPage() {
  const [rules, setRules] = useState<CachingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<CachingRule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error: showError } = useToast();
  
  const [newRule, setNewRule] = useState<Partial<CreateCachingRuleRequest>>({
    name: '',
    url_pattern: '',
    ttl: 3600,
    cache_level: 'standard',
    ignore_query_string: false,
    enabled: true,
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listCachingRules();
      if (data.length > 0) {
        setRules(data);
      } else {
        // Mock data fallback
        setRules([
          { id: 'cache-001', name: 'Static Assets', url_pattern: '/*.css', ttl: 86400, cache_level: 'aggressive', ignore_query_string: true, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'cache-002', name: 'JavaScript Files', url_pattern: '/*.js', ttl: 86400, cache_level: 'aggressive', ignore_query_string: true, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'cache-003', name: 'Images', url_pattern: '/images/*', ttl: 604800, cache_level: 'standard', ignore_query_string: false, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'cache-004', name: 'API Responses', url_pattern: '/api/*', ttl: 300, cache_level: 'standard', ignore_query_string: false, enabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch caching rules:', error);
      // Mock data fallback on error
      setRules([
        { id: 'cache-001', name: 'Static Assets', url_pattern: '/*.css', ttl: 86400, cache_level: 'aggressive', ignore_query_string: true, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'cache-002', name: 'JavaScript Files', url_pattern: '/*.js', ttl: 86400, cache_level: 'aggressive', ignore_query_string: true, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'cache-003', name: 'Images', url_pattern: '/images/*', ttl: 604800, cache_level: 'standard', ignore_query_string: false, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'cache-004', name: 'API Responses', url_pattern: '/api/*', ttl: 300, cache_level: 'standard', ignore_query_string: false, enabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleDeleteClick = (rule: CachingRule) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;
    
    setDeleting(true);
    try {
      await apiClient.deleteCachingRule(ruleToDelete.id);
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      success('Rule Deleted', `Caching rule "${ruleToDelete.name}" has been deleted`);
    } catch (error) {
      console.error('Failed to delete rule:', error);
      showError('Delete Failed', 'Could not delete the caching rule. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };

  const handleAddRule = async () => {
    try {
      const created = await apiClient.createCachingRule(newRule as CreateCachingRuleRequest);
      setRules([...rules, created]);
      setShowAddModal(false);
      setNewRule({ name: '', url_pattern: '', ttl: 3600, cache_level: 'standard', ignore_query_string: false, enabled: true });
      success('Rule Created', `Caching rule "${newRule.name}" has been created`);
    } catch (error) {
      console.error('Failed to create rule:', error);
      showError('Create Failed', 'Could not create the caching rule. Please try again.');
    }
  };

  const formatTTL = (ttl: number) => {
    if (ttl === 0) return 'No cache';
    if (ttl < 60) return `${ttl} sec`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)} min`;
    if (ttl < 86400) return `${Math.floor(ttl / 3600)} hour`;
    return `${Math.floor(ttl / 86400)} day`;
  };

  // Stats
  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.enabled).length,
    cacheHitRatio: '68.5%',
    bandwidthSaved: '98 GB',
  };

  return (
    <AppLayout activeMenu="caching">
      {/* Breadcrumb */}
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Edge</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Caching</span>
        </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchRules}
              className="btn-ghost"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-add"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading && rules.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Rules</span>
                    <HardDrive className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRules}</span>
                </div>
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Active Rules</span>
                    <RefreshCw className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-3xl font-bold text-green-600">{stats.activeRules}</span>
                </div>
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Cache Hit Ratio</span>
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-3xl font-bold text-purple-600">{stats.cacheHitRatio}</span>
                </div>
                <div className="card-container-padded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Bandwidth Saved</span>
                    <Globe className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-3xl font-bold text-orange-600">{stats.bandwidthSaved}</span>
                </div>
              </div>

              {/* Rules Table */}
              <div className="table-container">
                <div className="table-header">
                  <h3 className="table-title text-xl">Caching Rules</h3>
                  <p className="table-subtitle">Configure how content is cached at the edge</p>
                </div>
                <DataTable<CachingRule>
                  keyField="id"
                  data={rules}
                  emptyMessage="No caching rules configured"
                  columns={[
                    {
                      key: 'name',
                      header: 'Rule Name',
                      render: (rule) => <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{rule.name}</span>
                    },
                    {
                      key: 'url_pattern',
                      header: 'URL Pattern',
                      render: (rule) => <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{rule.url_pattern}</code>
                    },
                    {
                      key: 'ttl',
                      header: 'TTL',
                      render: (rule) => <span className="text-sm text-gray-600 dark:text-gray-400">{formatTTL(rule.ttl)}</span>
                    },
                    {
                      key: 'cache_level',
                      header: 'Cache Level',
                      render: (rule) => (
                        <Badge 
                          variant={rule.cache_level === 'aggressive' ? 'success' : rule.cache_level === 'standard' ? 'info' : 'default'}
                          size="sm"
                        >
                          {rule.cache_level}
                        </Badge>
                      )
                    },
                    {
                      key: 'enabled',
                      header: 'Status',
                      render: (rule) => (
                        <button
                          onClick={() => handleToggle(rule.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      )
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      align: 'right' as const,
                      render: (rule) => (
                        <div className="flex justify-end gap-2">
                          <button className="text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteClick(rule)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            </>
          )}
        </main>

      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add Caching Rule"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Rule Name"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            placeholder="e.g., Static Assets"
          />
          <Input
            label="URL Pattern"
            value={newRule.url_pattern}
            onChange={(e) => setNewRule({ ...newRule, url_pattern: e.target.value })}
            placeholder="e.g., /*.css"
          />
          <Input
            label="TTL (seconds)"
            type="number"
            value={newRule.ttl?.toString()}
            onChange={(e) => setNewRule({ ...newRule, ttl: parseInt(e.target.value) })}
            placeholder="3600"
          />
          <Select
            label="Cache Level"
            value={newRule.cache_level}
            onChange={(e) => setNewRule({ ...newRule, cache_level: e.target.value })}
            options={[
              { value: 'aggressive', label: 'Aggressive' },
              { value: 'standard', label: 'Standard' },
              { value: 'no-query-string', label: 'No Query String' },
            ]}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddRule}
            icon={<Save className="w-4 h-4" />}
          >
            Save Rule
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setRuleToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Caching Rule"
        message={`Are you sure you want to delete the caching rule "${ruleToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Rule"
        cancelLabel="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </AppLayout>
  );
}
