'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ui';
import { 
  Lock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Shield,
  Eye,
  ChevronDown,
  FileJson,
  Download
} from 'lucide-react';

// Types
interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  host: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  authenticated: boolean;
  schemaValidation: 'valid' | 'invalid' | 'missing';
  dataLabels: string[];
  lastSeen: string;
  requestCount: number;
}

// Mock data
const mockEndpoints: APIEndpoint[] = [
  {
    id: 'api-001',
    method: 'POST',
    path: '/api/bala/test',
    host: 'api.example.com',
    riskLevel: 'high',
    authenticated: false,
    schemaValidation: 'missing',
    dataLabels: ['Unauthenticated', 'BOPLA:ExcessiveDataExposure'],
    lastSeen: '2 min ago',
    requestCount: 15420,
  },
  {
    id: 'api-002',
    method: 'POST',
    path: '/labels',
    host: 'api.example.com',
    riskLevel: 'medium',
    authenticated: false,
    schemaValidation: 'valid',
    dataLabels: ['Unauthenticated', 'BOPLA:ExcessiveDataExposure', '+1 more'],
    lastSeen: '5 min ago',
    requestCount: 8932,
  },
  {
    id: 'api-003',
    method: 'GET',
    path: '/v1/get/config/APPL-CUSTOM-LABELS',
    host: 'api.example.com',
    riskLevel: 'medium',
    authenticated: false,
    schemaValidation: 'valid',
    dataLabels: ['Unauthenticated', 'BOPLA:ExcessiveDataExposure', 'IndianID(2)'],
    lastSeen: '10 min ago',
    requestCount: 4521,
  },
  {
    id: 'api-004',
    method: 'GET',
    path: '/api/users',
    host: 'api.example.com',
    riskLevel: 'critical',
    authenticated: true,
    schemaValidation: 'invalid',
    dataLabels: ['PII', 'Sensitive'],
    lastSeen: '1 min ago',
    requestCount: 25000,
  },
  {
    id: 'api-005',
    method: 'DELETE',
    path: '/api/users/{id}',
    host: 'api.example.com',
    riskLevel: 'critical',
    authenticated: true,
    schemaValidation: 'valid',
    dataLabels: ['Destructive', 'Admin'],
    lastSeen: '30 min ago',
    requestCount: 120,
  },
  {
    id: 'api-006',
    method: 'PUT',
    path: '/api/settings',
    host: 'api.example.com',
    riskLevel: 'low',
    authenticated: true,
    schemaValidation: 'valid',
    dataLabels: [],
    lastSeen: '1 hour ago',
    requestCount: 890,
  },
];

export default function APISecurityPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('inventory');
  const [activeTab, setActiveTab] = useState<'home' | 'application' | 'network' | 'data'>('application');
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>(mockEndpoints);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  
  const { info, success } = useToast();

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      POST: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      PUT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      PATCH: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600',
      none: 'text-gray-400',
    };
    return colors[risk as keyof typeof colors] || 'text-gray-400';
  };

  const getSchemaIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'missing': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const filteredEndpoints = endpoints.filter(ep => {
    const matchesSearch = ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ep.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || ep.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const stats = {
    totalEndpoints: endpoints.length,
    apiHosts: new Set(endpoints.map(e => e.host)).size,
    withRisks: endpoints.filter(e => e.riskLevel !== 'none').length,
    unauthenticated: endpoints.filter(e => !e.authenticated).length,
    sensitiveData: endpoints.filter(e => e.dataLabels.some(l => l.includes('PII') || l.includes('Sensitive'))).length,
    owaspRisks: endpoints.filter(e => e.dataLabels.some(l => l.includes('BOPLA'))).length,
  };

  return (
    <div className="flex h-screen bg-imperva-bg-primary">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          accountName="Your_Account_Name"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-imperva-blue hover:underline cursor-pointer">Home</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-imperva-blue hover:underline cursor-pointer">Security</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">API Security</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title text-xl flex items-center gap-2">
                <Lock className="w-6 h-6 text-imperva-blue" />
                API Security - Inventory
              </h1>
              <p className="page-subtitle mt-1">
                Discover and protect your API endpoints
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => info('Download Started', 'Downloading Swagger specification...')}
                className="btn-ghost"
              >
                <FileJson className="w-4 h-4" />
                Download Swagger
              </button>
              <button 
                onClick={() => success('Export Started', 'Exporting API endpoints to CSV...')}
                className="btn-ghost"
              >
                <Download className="w-4 h-4" />
                Export .csv
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">API Endpoints</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEndpoints}</p>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">API Hosts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.apiHosts}</p>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">API Discovery</p>
              <div className="flex gap-2 text-sm">
                <span className="text-blue-600">47</span>
                <span className="text-green-600">14</span>
                <span className="text-gray-400">257</span>
              </div>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Data Labels</p>
              <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span>16 Total</span>
                <span className="text-orange-600">12 Sensitive</span>
              </div>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">With Risks</p>
              <div className="flex gap-2 text-sm">
                <span className="text-red-600">{stats.owaspRisks} OWASP</span>
              </div>
            </div>
            <div className="card-container p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Unauthenticated</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unauthenticated}</p>
            </div>
          </div>

          {/* Website Filter & Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card mb-6 p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Websites</span>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  All Websites selected
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <button 
                onClick={() => info('Filters', 'Filter panel opened')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-imperva-blue hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters (1)
              </button>

              <button 
                onClick={() => info('Columns', 'Column settings opened')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Columns
              </button>
            </div>
          </div>

          {/* API Inventory Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">API Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">API Risks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data Labels</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredEndpoints.map((endpoint) => (
                  <tr key={endpoint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{endpoint.path}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {endpoint.dataLabels.filter(l => l.includes('Unauthenticated') || l.includes('BOPLA')).map((label, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-0.5 rounded text-xs ${
                              label.includes('BOPLA') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {endpoint.dataLabels.filter(l => !l.includes('Unauthenticated') && !l.includes('BOPLA')).map((label, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          >
                            {label}
                          </span>
                        ))}
                        {endpoint.dataLabels.length === 0 && <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => info('Endpoint Details', `Viewing details for ${endpoint.path}`)}
                        className="text-gray-400 hover:text-imperva-blue transition-colors"
                        title="View endpoint details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

