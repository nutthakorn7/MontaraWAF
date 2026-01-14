'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'full' | number;
}

export default function Dropdown({
  trigger,
  items,
  align = 'left',
  width = 'auto',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ width: typeof width === 'number' ? `${width}px` : width === 'full' ? '100%' : 'auto', minWidth: '160px' }}
        >
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="border-t border-gray-200 dark:border-gray-700 my-1" />
            ) : (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : item.danger
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// Simple dropdown button variant
export function DropdownButton({
  label,
  items,
  variant = 'default',
}: {
  label: string;
  items: DropdownItem[];
  variant?: 'default' | 'primary';
}) {
  return (
    <Dropdown
      trigger={
        <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          variant === 'primary'
            ? 'bg-imperva-blue text-white hover:bg-blue-600'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}>
          {label}
          <ChevronDown className="w-4 h-4" />
        </button>
      }
      items={items}
    />
  );
}
