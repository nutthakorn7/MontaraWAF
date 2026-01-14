'use client';

import React from 'react';
import { ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';

interface DistributionData {
  allRequests: string;
  requestsBlocked: string;
  wafSessions: string;
  allChange: number;
  blockedChange: number;
  sessionsChange: number;
}

interface ViolationType {
  type: string;
  sessions: number;
  currentSetting: string;
}

interface SecuritySettingsData {
  violationTypes: ViolationType[];
}

interface WAFSecurityDashboardProps {
  distribution: DistributionData;
  securitySettings: SecuritySettingsData;
}

export default function WAFSecurityDashboard({ 
  distribution, 
  securitySettings 
}: WAFSecurityDashboardProps) {
  const ChangeIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={`text-sm flex items-center gap-0.5 ${
        isPositive ? 'text-green-500' : 'text-red-500'
      }`}>
        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {Math.abs(value)}%
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Which security events affected my websites?
        </h3>
        <button 
          onClick={() => {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            toast.textContent = 'Opening menu...';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 grid grid-cols-3 gap-8">
        {/* Distribution Column */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-1">
            Distribution
            <span className="text-gray-400 cursor-help">ⓘ</span>
          </h4>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">All requests</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{distribution.allRequests}</span>
                <ChangeIndicator value={distribution.allChange} />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Requests blocked</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{distribution.requestsBlocked}</span>
                <ChangeIndicator value={distribution.blockedChange} />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">WAF Sessions <span className="text-gray-400 cursor-help">ⓘ</span></p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{distribution.wafSessions}</span>
                <ChangeIndicator value={distribution.sessionsChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart - Larger Size */}
        <div className="flex items-center justify-center">
          <div className="w-64 h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="12"
                strokeDasharray="180 360"
                transform="rotate(-90 50 50)"
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="12"
                strokeDasharray="80 360"
                strokeDashoffset="-180"
                transform="rotate(-90 50 50)"
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="12"
                strokeDasharray="50 360"
                strokeDashoffset="-260"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                WAF sessions<br/>by violation type
              </span>
            </div>
          </div>
        </div>

        {/* Security Settings Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Security settings
              <span className="text-gray-400 cursor-help">ⓘ</span>
            </h4>
            <a href="/policies" className="text-sm text-imperva-blue hover:underline">
              View settings
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                toast.textContent = 'WAF policies selected';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
              }}
              className="px-3 py-1.5 text-sm font-medium bg-imperva-blue text-white rounded transition-colors"
            >
              WAF policies
            </button>
            <button 
              onClick={() => {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                toast.textContent = 'Security rules selected';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Security rules
            </button>
          </div>

          {/* Settings Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium text-center">Sessions</th>
                <th className="pb-2 font-medium">Current setting</th>
              </tr>
            </thead>
            <tbody>
              {securitySettings.violationTypes.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2">
                    <a href="/policies" className="text-imperva-blue hover:underline">
                      {item.type}
                    </a>
                  </td>
                  <td className="py-2 text-center text-gray-900">{item.sessions}</td>
                  <td className="py-2 text-gray-600">{item.currentSetting}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
