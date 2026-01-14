'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const sizeClasses = {
  sm: { box: 'w-4 h-4', icon: 'w-3 h-3', text: 'text-sm' },
  md: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5', text: 'text-sm' },
  lg: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base' },
};

export default function Checkbox({
  checked = false,
  onChange = () => {},
  label,
  description,
  indeterminate = false,
  disabled = false,
  size = 'md',
  error,
}: CheckboxProps) {
  const sizes = sizeClasses[size];
  const isChecked = checked || indeterminate;

  return (
    <label className={`inline-flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`${sizes.box} rounded border-2 flex items-center justify-center transition-colors ${
            isChecked
              ? 'bg-imperva-blue border-imperva-blue'
              : error
              ? 'border-red-500 bg-white dark:bg-gray-800'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          } ${!disabled && 'hover:border-imperva-blue'}`}
        >
          {indeterminate ? (
            <Minus className={`${sizes.icon} text-white`} />
          ) : checked ? (
            <Check className={`${sizes.icon} text-white`} />
          ) : null}
        </div>
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className={`block font-medium text-gray-900 dark:text-gray-100 ${sizes.text}`}>
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </span>
          )}
          {error && (
            <span className="block text-sm text-red-500 mt-1">{error}</span>
          )}
        </div>
      )}
    </label>
  );
}

// Checkbox Group
export function CheckboxGroup({
  options,
  value,
  onChange,
  label,
  orientation = 'vertical',
}: {
  options: { id: string; label: string; description?: string; disabled?: boolean }[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  const handleChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionId]);
    } else {
      onChange(value.filter((id) => id !== optionId));
    }
  };

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{label}</p>
      )}
      <div className={`flex ${orientation === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-3'}`}>
        {options.map((option) => (
          <Checkbox
            key={option.id}
            checked={value.includes(option.id)}
            onChange={(checked) => handleChange(option.id, checked)}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </div>
    </div>
  );
}
