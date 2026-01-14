'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, MoreHorizontal, ExternalLink } from 'lucide-react';

interface SecurityMetricCardProps {
  label: string;
  value: string;
  change: number;
  subMetrics?: Array<{
    label: string;
    value: string;
    color: string;
  }>;
  links?: string[];
  linkDestination?: string; // Route to navigate to when clicking View Dashboard
}

export default function SecurityMetricCard({ 
  label, 
  value, 
  change, 
  subMetrics = [], 
  links = [],
  linkDestination
}: SecurityMetricCardProps) {
  const router = useRouter();
  const isPositive = change >= 0;

  const handleLinkClick = (link: string) => {
    // Map link text to routes
    const routeMap: { [key: string]: string } = {
      'View Dashboard': linkDestination || '/attack-analytics',
      'ATD - Client Classification': '/bot-protection',
      'ATD - Attack Classification': '/attack-analytics',
    };

    const route = routeMap[link] || '/attack-analytics';
    router.push(route);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-600 dark:text-gray-400">{label}</h3>
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors peer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all">
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
                Customize
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Export Data
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg">
                Hide Widget
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-400">sessions</span>
      </div>

      {/* Sub Metrics Bar */}
      {subMetrics.length > 0 && (
        <div className="mb-3">
          <div className="flex h-2 rounded-full overflow-hidden">
            {subMetrics.map((metric, idx) => (
              <div 
                key={idx}
                className="h-full transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: metric.color,
                  width: `${100 / subMetrics.length}%`
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {subMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-gray-500 dark:text-gray-400">{metric.label}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {links.map((link, idx) => (
            <button 
              key={idx}
              onClick={() => handleLinkClick(link)}
              className="flex items-center gap-1 text-xs text-imperva-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors group"
            >
              {link}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
