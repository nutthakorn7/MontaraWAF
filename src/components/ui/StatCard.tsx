'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'orange';
  className?: string;
}

const colorStyles = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  red: 'text-red-500',
  purple: 'text-purple-500',
  yellow: 'text-yellow-500',
  orange: 'text-orange-500',
};

const valueColors = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  yellow: 'text-yellow-600',
  orange: 'text-orange-600',
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-imperva-dark-header rounded-xl p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        {icon && <span className={colorStyles[color]}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${valueColors[color]} dark:text-gray-100`}>
          {value}
        </span>
        {trend && (
          <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            {trend.label && <span className="text-gray-400 ml-1">{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
