'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, RefreshCw, LayoutGrid, Calendar, FileText, FileSpreadsheet, FileImage } from 'lucide-react';

interface StatsBarProps {
  stats: Array<{
    label: string;
    value: string;
  }>;
  timeRange: string;
  onRefresh?: () => void;
  onTimeRangeChange?: (range: string) => void;
}

const TIME_RANGES = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 14 Days', value: '14d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Custom Range', value: 'custom' },
];

const EXPORT_OPTIONS = [
  { label: 'Export as PDF', value: 'pdf', icon: FileText },
  { label: 'Export as CSV', value: 'csv', icon: FileSpreadsheet },
  { label: 'Export as PNG', value: 'png', icon: FileImage },
];

export default function StatsBar({ stats, timeRange, onRefresh, onTimeRangeChange }: StatsBarProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  
  const timePickerRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownload(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeRangeSelect = (range: typeof TIME_RANGES[0]) => {
    setSelectedTimeRange(range.label);
    setShowTimePicker(false);
    onTimeRangeChange?.(range.value);
  };

  const handleExport = (format: string) => {
    setShowDownload(false);
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = `Generating ${format.toUpperCase()} report...`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Time Picker Dropdown */}
          <div className="relative" ref={timePickerRef}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Time Picker</span>
              <button 
                onClick={() => setShowTimePicker(!showTimePicker)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
              >
                {selectedTimeRange}
                <ChevronDown className={`w-4 h-4 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Time Picker Dropdown Menu */}
            {showTimePicker && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleTimeRangeSelect(range)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                      selectedTimeRange === range.label 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Report Dropdown */}
          <div className="relative" ref={downloadRef}>
            <button 
              onClick={() => setShowDownload(!showDownload)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download report
              <ChevronDown className={`w-3 h-3 transition-transform ${showDownload ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Download Dropdown Menu */}
            {showDownload && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {EXPORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleExport(option.value)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-3"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Arrange */}
          <button 
            onClick={() => {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = 'Dashboard arrangement mode enabled. Drag widgets to reorder.';
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 3000);
            }}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Arrange
          </button>
        </div>
      </div>
    </div>
  );
}
