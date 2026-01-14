'use client';

import React from 'react';
import { Radio } from 'lucide-react';

interface RadioOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const sizeClasses = {
  sm: { radio: 'w-4 h-4', dot: 'w-2 h-2', text: 'text-sm' },
  md: { radio: 'w-5 h-5', dot: 'w-2.5 h-2.5', text: 'text-sm' },
  lg: { radio: 'w-6 h-6', dot: 'w-3 h-3', text: 'text-base' },
};

export default function RadioGroup({
  options,
  value,
  onChange,
  label,
  orientation = 'vertical',
  size = 'md',
  error,
}: RadioGroupProps) {
  const sizes = sizeClasses[size];

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{label}</p>
      )}
      <div className={`flex ${orientation === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-3'}`}>
        {options.map((option) => (
          <label
            key={option.id}
            className={`inline-flex items-start gap-3 ${option.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="radio"
                name={label || 'radio-group'}
                value={option.id}
                checked={value === option.id}
                onChange={() => !option.disabled && onChange(option.id)}
                disabled={option.disabled}
                className="sr-only"
              />
              <div
                className={`${sizes.radio} rounded-full border-2 flex items-center justify-center transition-colors ${
                  value === option.id
                    ? 'border-imperva-blue bg-white dark:bg-gray-800'
                    : error
                    ? 'border-red-500 bg-white dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                } ${!option.disabled && 'hover:border-imperva-blue'}`}
              >
                {value === option.id && (
                  <div className={`${sizes.dot} rounded-full bg-imperva-blue`} />
                )}
              </div>
            </div>
            <div className="flex-1">
              <span className={`block font-medium text-gray-900 dark:text-gray-100 ${sizes.text}`}>
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
