'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/ui/Button';
import { DataTable, Badge } from '@/components/ui';
import { FileText, Download, Calendar, Clock, CheckCircle, RefreshCw, Plus, Trash2, Shield, Activity, BarChart, FileCheck } from 'lucide-react';
import { apiClient, Report } from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = (id: string, url: string) => {
    window.open(url, '_blank');
  };

  const handleGenerate = async (type: string) => {
    try {
      setGeneratingId(type);
      const newReport = await apiClient.generateReport({
        type,
        format: 'pdf',
        frequency: 'one-time',
        parameters: {}
      });
      setReports([newReport, ...reports]);
      setTimeout(() => {
        setGeneratingId(null);
        fetchReports();
      }, 2000);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setGeneratingId(null);
    }
  };

  const quickReports = [
    { label: 'Security Summary', icon: <Shield className="w-6 h-6 text-red-500" />, type: 'security' },
    { label: 'Traffic Analysis', icon: <BarChart className="w-6 h-6 text-green-500" />, type: 'traffic' },
    { label: 'Performance Report', icon: <Activity className="w-6 h-6 text-blue-500" />, type: 'performance' },
    { label: 'Compliance Export', icon: <FileCheck className="w-6 h-6 text-purple-500" />, type: 'compliance' },
  ];

  return (
    <AppLayout activeMenu="reports">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Data' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary"
              size="md"
              onClick={fetchReports}
              loading={loading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              {''}
            </Button>
            <Button 
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              Create Report
            </Button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Quick Generate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {quickReports.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleGenerate(q.type)}
                disabled={generatingId === q.type}
                className="card-container-padded hover:shadow-lg transition-shadow text-left disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{q.icon}</span>
                  {generatingId === q.type && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{q.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {generatingId === q.type ? 'Generating...' : 'Generate now'}
                </p>
              </button>
            ))}
          </div>

          {/* Reports Table */}
          {/* Reports Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Generated Reports</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access your security and performance reports</p>
            </div>
            
            {loading && reports.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
              </div>
            ) : (
              <DataTable<Report>
                keyField="id"
                data={reports}
                emptyMessage="No reports generated yet"
                columns={[
                  {
                    key: 'name',
                    header: 'Report Name',
                    render: (report) => (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{report.name}</span>
                      </div>
                    )
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    render: (report) => (
                      <Badge 
                        variant={report.type === 'security' ? 'error' : report.type === 'performance' ? 'info' : report.type === 'traffic' ? 'success' : 'purple'}
                        size="sm"
                      >
                        {report.type}
                      </Badge>
                    )
                  },
                  {
                    key: 'frequency',
                    header: 'Frequency',
                    render: (report) => (
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {report.frequency}
                      </span>
                    )
                  },
                  {
                    key: 'format',
                    header: 'Format',
                    render: (report) => <span className="text-sm text-gray-600 dark:text-gray-400 uppercase">{report.format}</span>
                  },
                  {
                    key: 'generated_at',
                    header: 'Generated At',
                    render: (report) => {
                      const dateStr = report.generated_at || report.created_at;
                      if (!dateStr) return <span className="text-sm text-gray-500">-</span>;
                      const date = new Date(dateStr);
                      const isValidDate = !isNaN(date.getTime());
                      return (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {isValidDate ? date.toLocaleString() : '-'}
                        </span>
                      );
                    }
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (report) => (
                      report.status === 'ready' || report.status === 'completed' ? (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ready</span>
                      ) : report.status === 'generating' || report.status === 'processing' ? (
                        <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Generating</span>
                      ) : (
                        <span className="text-xs text-gray-500 capitalize">{report.status}</span>
                      )
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    align: 'right' as const,
                    render: (report) => (
                      <button 
                        onClick={() => handleDownload(report.id, report.url)} 
                        disabled={report.status !== 'ready' && report.status !== 'completed'}
                        className="text-imperva-blue hover:underline text-sm disabled:opacity-50"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4 inline" />
                      </button>
                    )
                  }
                ]}
              />
            )}
          </div>
        </main>
    </AppLayout>
  );
}
