'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  };

  const style: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton variant="text" width="60%" height={32} className="mb-2" />
      <Skeleton variant="text" width="30%" height={16} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" width={`${15 + i * 5}%`} height={16} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="text" width={`${10 + i * 5}%`} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <Skeleton variant="text" width="30%" height={20} className="mb-4" />
      <Skeleton variant="rectangular" width="100%" height={height} />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="flex gap-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} className="flex-1" />
      ))}
    </div>
  );
}
