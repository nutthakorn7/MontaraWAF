'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const variantConfig = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <Info className="w-5 h-5 text-blue-500" />,
    title: 'text-blue-800 dark:text-blue-300',
    text: 'text-blue-700 dark:text-blue-400',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    title: 'text-green-800 dark:text-green-300',
    text: 'text-green-700 dark:text-green-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    title: 'text-yellow-800 dark:text-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    title: 'text-red-800 dark:text-red-300',
    text: 'text-red-700 dark:text-red-400',
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex-shrink-0">
        {icon || config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={`text-sm font-semibold mb-1 ${config.title}`}>{title}</h3>
        )}
        <div className={`text-sm ${config.text}`}>{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${config.text}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
