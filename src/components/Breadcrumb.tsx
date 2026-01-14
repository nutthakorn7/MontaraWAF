'use client';

import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  actions?: ReactNode;
}

export default function Breadcrumb({ items, actions }: BreadcrumbProps) {
  return (
    <div className="bg-white dark:bg-imperva-dark-header border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      <nav className="flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            {item.href || item.onClick ? (
              <span 
                className="text-imperva-blue hover:underline cursor-pointer"
                onClick={item.onClick}
              >
                {item.label}
              </span>
            ) : (
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
