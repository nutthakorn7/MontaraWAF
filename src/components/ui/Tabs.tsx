'use client';

import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getVariantClasses = (isActive: boolean, isDisabled?: boolean) => {
    if (isDisabled) return 'text-gray-400 cursor-not-allowed';
    
    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-imperva-blue text-white rounded-lg'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg';
      case 'underline':
        return isActive
          ? 'text-imperva-blue border-b-2 border-imperva-blue'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-b-2 border-transparent';
      default:
        return isActive
          ? 'bg-white dark:bg-gray-800 text-imperva-blue border-b-2 border-imperva-blue'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200';
    }
  };

  return (
    <div className={`flex ${variant === 'underline' ? 'border-b border-gray-200 dark:border-gray-700' : 'gap-1'} ${fullWidth ? 'w-full' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id, tab.disabled)}
          disabled={tab.disabled}
          className={`
            flex items-center gap-2 font-medium transition-colors
            ${sizeClasses[size]}
            ${getVariantClasses(activeTab === tab.id, tab.disabled)}
            ${fullWidth ? 'flex-1 justify-center' : ''}
          `}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === tab.id 
                ? 'bg-white/20 text-current' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
