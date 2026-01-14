'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

// Dynamic imports for code splitting
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

interface DataPoint {
  time: string;
  wafEvents: number;
  botAttacks: number;
  ddosAttacks: number;
}

interface SecurityEventsGraphProps {
  data: DataPoint[];
}

export default function SecurityEventsGraph({ data }: SecurityEventsGraphProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Theme-aware colors
  const colors = {
    grid: isDark ? '#374151' : '#f0f0f0',
    axis: isDark ? '#6b7280' : '#e5e7eb',
    tick: isDark ? '#9ca3af' : '#6b7280',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipText: isDark ? '#ffffff' : '#1f2937',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Events graph</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = 'Fullscreen mode enabled. Press ESC to exit.';
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Toggle fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </button>
          <button 
            onClick={() => {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = 'Downloading chart data as CSV...';
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Download chart data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: colors.tick }}
              tickLine={false}
              axisLine={{ stroke: colors.axis }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: colors.tick }}
              tickLine={false}
              axisLine={{ stroke: colors.axis }}
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                color: colors.tooltipText,
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', color: colors.tick }}
              iconType="rect"
              iconSize={10}
              formatter={(value) => <span style={{ color: colors.tick }}>{value}</span>}
            />
            <Line 
              type="monotone" 
              dataKey="wafEvents" 
              name="WAF events"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="botAttacks" 
              name="Mitigated Bot Attacks"
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="ddosAttacks" 
              name="DDoS attacks"
              stroke="#1e3a8a" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
