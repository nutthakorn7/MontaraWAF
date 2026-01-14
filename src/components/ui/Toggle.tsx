'use client';

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  color?: 'green' | 'blue' | 'red';
}

const sizeClasses = {
  sm: { track: 'w-8 h-4', thumb: 'h-3 w-3', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'h-4 w-4', translate: 'translate-x-6' },
  lg: { track: 'w-14 h-7', thumb: 'h-5 w-5', translate: 'translate-x-7' },
};

const colorClasses = {
  green: 'bg-green-500',
  blue: 'bg-imperva-blue',
  red: 'bg-red-500',
};

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  color = 'green',
}: ToggleProps) {
  const sizes = sizeClasses[size];
  
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="mr-4">
          {label && <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>}
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-imperva-blue ${sizes.track} ${
          checked ? colorClasses[color] : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block rounded-full bg-white shadow-sm transform transition-transform ${sizes.thumb} ${
            checked ? sizes.translate : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
