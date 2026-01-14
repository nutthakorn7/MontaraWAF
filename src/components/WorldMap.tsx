'use client';

import React from 'react';

interface CountryData {
  country: string;
  events: number;
}

interface WorldMapProps {
  data?: CountryData[];
  title?: string;
}

const getColor = (events: number): string => {
  if (events > 5000) return '#DC2626'; // Red - Critical
  if (events > 3000) return '#F97316'; // Orange - High
  if (events > 1000) return '#FBBF24'; // Yellow - Medium
  if (events > 500) return '#22C55E'; // Green - Low
  if (events > 0) return '#3B82F6'; // Blue - Minimal
  return '#1E293B'; // Dark - No data
};

export default function WorldMap({ data = [], title = 'Security Events by Country' }: WorldMapProps) {
  // Get top countries for display
  const sortedData = [...data].sort((a, b) => b.events - a.events).slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {/* Simple SVG World Map Representation */}
      <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ height: '300px' }}>
        <svg viewBox="0 0 800 400" className="w-full h-full">
          {/* Simplified world outline */}
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          
          {/* Ocean background */}
          <rect x="0" y="0" width="800" height="400" fill="url(#oceanGradient)" />
          
          {/* Simplified continents */}
          {/* North America */}
          <ellipse cx="180" cy="120" rx="100" ry="70" fill="#1E293B" opacity="0.9" />
          
          {/* South America */}
          <ellipse cx="220" cy="280" rx="50" ry="90" fill="#1E293B" opacity="0.9" />
          
          {/* Europe */}
          <ellipse cx="420" cy="100" rx="60" ry="40" fill="#1E293B" opacity="0.9" />
          
          {/* Africa */}
          <ellipse cx="430" cy="220" rx="60" ry="80" fill="#1E293B" opacity="0.9" />
          
          {/* Asia */}
          <ellipse cx="580" cy="130" rx="120" ry="80" fill="#1E293B" opacity="0.9" />
          
          {/* Australia */}
          <ellipse cx="680" cy="300" rx="50" ry="35" fill="#1E293B" opacity="0.9" />
          
          {/* Country hotspots with events */}
          {sortedData.map((item, index) => {
            // Approximate positions for common countries
            const positions: Record<string, { x: number; y: number }> = {
              'United States': { x: 150, y: 130 },
              'USA': { x: 150, y: 130 },
              'China': { x: 620, y: 140 },
              'Russia': { x: 550, y: 80 },
              'India': { x: 560, y: 180 },
              'Brazil': { x: 230, y: 260 },
              'Germany': { x: 420, y: 100 },
              'France': { x: 400, y: 110 },
              'United Kingdom': { x: 390, y: 90 },
              'UK': { x: 390, y: 90 },
              'Japan': { x: 700, y: 130 },
              'Australia': { x: 680, y: 300 },
              'Israel': { x: 470, y: 160 },
              'Thailand': { x: 600, y: 200 },
              'Canada': { x: 170, y: 90 },
            };
            
            const pos = positions[item.country] || { x: 400 + (index * 30), y: 200 };
            const radius = Math.min(30, Math.max(10, Math.sqrt(item.events) / 5));
            
            return (
              <g key={item.country}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={getColor(item.events)}
                  opacity="0.8"
                  className="transition-all duration-300 hover:opacity-100"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 3}
                  fill="none"
                  stroke={getColor(item.events)}
                  strokeWidth="2"
                  opacity="0.4"
                />
              </g>
            );
          })}
          
          {/* Grid lines */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
        </svg>
        
        {/* Overlay with country list */}
        <div className="absolute right-2 top-2 bg-gray-900/80 backdrop-blur rounded-lg p-2 text-xs text-white max-h-48 overflow-y-auto">
          {sortedData.slice(0, 5).map((item) => (
            <div key={item.country} className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(item.events) }} />
              <span className="truncate max-w-[80px]">{item.country}</span>
              <span className="text-gray-400 ml-auto">{item.events.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DC2626' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Critical (&gt;5K)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F97316' }}></div>
          <span className="text-gray-600 dark:text-gray-400">High (&gt;3K)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FBBF24' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Medium (&gt;1K)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22C55E' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Low (&gt;500)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Minimal</span>
        </div>
      </div>
    </div>
  );
}
