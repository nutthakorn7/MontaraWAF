'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Book, 
  Keyboard, 
  MessageCircle, 
  Sparkles,
  ExternalLink,
  FileText,
  Video
} from 'lucide-react';

const HELP_ITEMS = [
  { 
    label: 'Documentation', 
    icon: Book, 
    description: 'Read the user guide',
    onClick: () => window.open('https://docs.example.com', '_blank')
  },
  { 
    label: 'Keyboard Shortcuts', 
    icon: Keyboard, 
    description: 'View all shortcuts',
    shortcut: '⌘K'
  },
  { 
    label: 'Video Tutorials', 
    icon: Video, 
    description: 'Watch how-to videos',
    onClick: () => window.open('https://youtube.com', '_blank')
  },
  { 
    label: 'Release Notes', 
    icon: FileText, 
    description: 'See what\'s new',
  },
  { 
    label: 'Contact Support', 
    icon: MessageCircle, 
    description: 'Get help from our team',
  },
];

export default function HelpDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowShortcuts(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: typeof HELP_ITEMS[0]) => {
    if (item.label === 'Keyboard Shortcuts') {
      setShowShortcuts(true);
    } else if (item.onClick) {
      item.onClick();
      setIsOpen(false);
    } else {
      // Show toast for demo items
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Opening ${item.label}...`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
      setIsOpen(false);
    }
  };

  const SHORTCUTS = [
    { keys: ['⌘', 'K'], description: 'Open search' },
    { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
    { keys: ['⌘', 'D'], description: 'Toggle dark mode' },
    { keys: ['⌘', '/'], description: 'Show shortcuts' },
    { keys: ['Esc'], description: 'Close modals' },
    { keys: ['⌘', 'S'], description: 'Save changes' },
    { keys: ['⌘', '↵'], description: 'Submit form' },
    { keys: ['←', '→'], description: 'Navigate tabs' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setShowShortcuts(false);
        }}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
      >
        <span className="text-sm">? Help</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !showShortcuts && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-2">
            {HELP_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                  {item.shortcut && (
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  )}
                  {item.onClick && (
                    <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Montara WAF v2.0.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {isOpen && showShortcuts && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="text-xs text-blue-600 hover:underline"
            >
              Back
            </button>
          </div>
          <div className="p-2 max-h-80 overflow-y-auto">
            {SHORTCUTS.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, kidx) => (
                    <React.Fragment key={kidx}>
                      <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-mono">
                        {key}
                      </kbd>
                      {kidx < shortcut.keys.length - 1 && (
                        <span className="text-gray-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
