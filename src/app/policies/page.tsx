'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog, useToast } from '@/components/ui';
import { 
  Plus, 
  Search, 
  Shield,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { apiClient, Policy } from '@/lib/api';

const ruleTypes = [
  { value: 'sql_injection', label: 'SQL Injection', icon: '💉' },
  { value: 'xss', label: 'XSS', icon: '🔓' },
  { value: 'bot', label: 'Bot Protection', icon: '🤖' },
  { value: 'ddos', label: 'DDoS', icon: '🌊' },
  { value: 'rfi', label: 'Remote File Inclusion', icon: '📁' },
  { value: 'lfi', label: 'Local File Inclusion', icon: '📂' },
  { value: 'custom', label: 'Custom Rule', icon: '⚙️' },
];

export default function PoliciesPage() {
  const [rules, setRules] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Confirm dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Policy | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Toast notifications
  const { success, error: showError } = useToast();

  // Mock data fallback
  const getMockPolicies = (): Policy[] => [
    {
      id: '1',
      name: 'SQL Injection Protection',
      description: 'Blocks common SQL injection attack patterns',
      type: 'sql_injection',
      action: 'block',
      severity: 'critical',
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'XSS Filter',
      description: 'Detects and blocks cross-site scripting attempts',
      type: 'xss',
      action: 'block',
      severity: 'high',
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Bot Detection',
      description: 'Identifies and challenges suspicious bot traffic',
      type: 'bot',
      action: 'challenge',
      severity: 'medium',
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'DDoS Mitigation',
      description: 'Rate limiting and DDoS attack prevention',
      type: 'ddos',
      action: 'block',
      severity: 'critical',
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Remote File Inclusion Block',
      description: 'Prevents remote file inclusion attacks',
      type: 'rfi',
      action: 'block',
      severity: 'high',
      enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'API Rate Limiter',
      description: 'Limits API requests per IP address',
      type: 'custom',
      action: 'alert',
      severity: 'low',
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listPolicies();
      if (data && data.length > 0) {
        setRules(data);
      } else {
        // Use mock data if API returns empty
        setRules(getMockPolicies());
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      // Fallback to mock data
      setRules(getMockPolicies());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'block': return 'bg-red-100 text-red-700';
      case 'allow': return 'bg-green-100 text-green-700';
      case 'alert': return 'bg-yellow-100 text-yellow-700';
      case 'challenge': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    const found = ruleTypes.find(t => t.value === type);
    return found ? found.icon : '📋';
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      success(
        rule.enabled ? 'Rule Disabled' : 'Rule Enabled',
        `${rule.name} has been ${rule.enabled ? 'disabled' : 'enabled'}`
      );
    }
  };

  const handleDeleteClick = (rule: Policy) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;
    
    setDeleting(true);
    try {
      await apiClient.deletePolicy(ruleToDelete.id);
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      success('Rule Deleted', `${ruleToDelete.name} has been deleted successfully`);
    } catch (err) {
      console.error('Failed to delete policy:', err);
      showError('Delete Failed', 'Failed to delete the rule. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesAction = filterAction === 'all' || rule.action === filterAction;
    return matchesSearch && matchesType && matchesAction;
  });

  const stats = {
    total: rules.length,
    enabled: rules.filter(r => r.enabled).length,
    blocking: rules.filter(r => r.action === 'block').length,
  };

  return (
    <AppLayout activeMenu="policies">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">WAF Policies</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title text-xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-imperva-blue" />
                WAF Policies
              </h1>
              <p className="page-subtitle mt-1">
                Manage your Web Application Firewall rules and policies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                onClick={fetchPolicies}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              />
              <Button 
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Create Rule
              </Button>
            </div>
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
                <div className="bg-white rounded-lg p-4 shadow-card">
                  <p className="text-sm text-gray-500">Total Rules</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-card">
                  <p className="text-sm text-gray-500">Active Rules</p>
                  <p className="text-2xl font-bold text-green-600">{stats.enabled}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-card">
                  <p className="text-sm text-gray-500">Blocking Rules</p>
                  <p className="text-2xl font-bold text-red-600">{stats.blocking}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-card">
                  <p className="text-sm text-gray-500">Alert Rules</p>
                  <p className="text-2xl font-bold text-imperva-blue">{rules.filter(r => r.action === 'alert').length}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-card mb-6">
                <div className="p-4 flex items-center gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue"
                  >
                    <option value="all">All Types</option>
                    {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  {/* Action Filter */}
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue"
                  >
                    <option value="all">All Actions</option>
                    <option value="block">Block</option>
                    <option value="allow">Allow</option>
                    <option value="alert">Alert</option>
                    <option value="challenge">Challenge</option>
                  </select>
                </div>
              </div>

              {/* Rules Table */}
              <div className="bg-white rounded-lg shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => toggleRule(rule.id)}
                            className={`${rule.enabled ? 'text-green-500' : 'text-gray-400'}`}
                          >
                            {rule.enabled ? (
                              <ToggleRight className="w-6 h-6" />
                            ) : (
                              <ToggleLeft className="w-6 h-6" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{rule.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{rule.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1">
                            <span>{getTypeIcon(rule.type)}</span>
                            <span className="text-sm text-gray-600">
                              {ruleTypes.find(t => t.value === rule.type)?.label || rule.type}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getActionColor(rule.action)}`}>
                            {rule.action}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(rule.severity)}`} />
                            <span className="text-sm text-gray-600 capitalize">{rule.severity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-1 text-gray-400 hover:text-imperva-blue transition-colors"
                              title="Edit rule"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-imperva-blue transition-colors"
                              title="Duplicate rule"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(rule)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                {filteredRules.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No rules found matching your filters</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setRuleToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Rule"
        message={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Rule"
        cancelLabel="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </AppLayout>
  );
}
