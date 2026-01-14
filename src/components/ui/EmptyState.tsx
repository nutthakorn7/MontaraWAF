'use client';

import React from 'react';
import { Search, FileQuestion, Database, Wifi, ShieldOff } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'no-data' | 'no-results' | 'error' | 'offline' | 'no-access';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variants = {
  'no-data': {
    icon: Database,
    defaultTitle: 'No data available',
    defaultDescription: 'There is no data to display at the moment.'
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'No results found',
    defaultDescription: 'Try adjusting your search or filter criteria.'
  },
  'error': {
    icon: FileQuestion,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'An error occurred while loading the data. Please try again.'
  },
  'offline': {
    icon: Wifi,
    defaultTitle: 'You\'re offline',
    defaultDescription: 'Please check your internet connection and try again.'
  },
  'no-access': {
    icon: ShieldOff,
    defaultTitle: 'Access denied',
    defaultDescription: 'You don\'t have permission to view this content.'
  }
};

export default function EmptyState({ 
  variant = 'no-data',
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const { icon: Icon, defaultTitle, defaultDescription } = variants[variant];

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description || defaultDescription}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-imperva-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
