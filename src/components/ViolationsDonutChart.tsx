'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for code splitting
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface DonutData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface ViolationsDonutChartProps {
  data: DonutData[];
  title: string;
  centerLabel?: string;
  centerValue?: string;
}

export default function ViolationsDonutChart({ 
  data, 
  title, 
  centerLabel, 
  centerValue 
}: ViolationsDonutChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    return () => observer.disconnect();
  }, []);

  const colors = {
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipText: isDark ? '#ffffff' : '#1f2937',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
  };

  return (
    <div className="flex flex-col">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-1">
        {title}
        <span 
          className="text-gray-400 cursor-help relative group"
          title="Distribution of security violations by category"
        >
          ⓘ
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Distribution of violations by category
          </span>
        </span>
      </h4>
      
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                color: colors.tooltipText,
                fontSize: '12px'
              }}
              formatter={(value) => typeof value === 'number' ? [`${value.toFixed(1)}%`, ''] : [value, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        {centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{centerValue}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-white">{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
