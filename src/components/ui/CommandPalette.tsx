'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Command, 
  Shield, 
  Activity, 
  Globe, 
  Settings, 
  FileText, 
  BarChart,
  Network,
  Lock,
  Bot,
  Zap,
  Server,
  Database,
  Users,
  Key,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  category: string;
  keywords?: string[];
}

const commands: CommandItem[] = [
  // Security
  { id: 'security-dashboard', label: 'Security Dashboard', icon: <Shield className="w-4 h-4" />, href: '/security-dashboard', category: 'Security', keywords: ['overview', 'main'] },
  { id: 'policies', label: 'WAF Policies', icon: <FileText className="w-4 h-4" />, href: '/policies', category: 'Security', keywords: ['rules', 'waf'] },
  { id: 'security-events', label: 'Security Events', icon: <Activity className="w-4 h-4" />, href: '/security-events', category: 'Security', keywords: ['logs', 'alerts'] },
  { id: 'ip-management', label: 'IP Management', icon: <Globe className="w-4 h-4" />, href: '/ip-management', category: 'Security', keywords: ['whitelist', 'blacklist', 'block'] },
  { id: 'bot-protection', label: 'Bot Protection', icon: <Bot className="w-4 h-4" />, href: '/bot-protection', category: 'Security', keywords: ['crawler', 'scraper'] },
  { id: 'ddos-protection', label: 'DDoS Protection', icon: <Shield className="w-4 h-4" />, href: '/ddos-protection', category: 'Security', keywords: ['attack', 'mitigation'] },
  
  // Analytics
  { id: 'attack-analytics', label: 'Attack Analytics', icon: <Zap className="w-4 h-4" />, href: '/attack-analytics', category: 'Analytics', keywords: ['threats', 'incidents'] },
  { id: 'attack-stories', label: 'Attack Stories', icon: <FileText className="w-4 h-4" />, href: '/attack-stories', category: 'Analytics', keywords: ['ai', 'narrative'] },
  { id: 'reports', label: 'Reports', icon: <BarChart className="w-4 h-4" />, href: '/reports', category: 'Analytics', keywords: ['export', 'pdf'] },
  { id: 'real-time', label: 'Real-Time Dashboard', icon: <Activity className="w-4 h-4" />, href: '/real-time', category: 'Analytics', keywords: ['live', 'monitor'] },
  
  // Network & Edge
  { id: 'network', label: 'Network Dashboard', icon: <Network className="w-4 h-4" />, href: '/network', category: 'Network', keywords: ['bandwidth', 'traffic'] },
  { id: 'performance', label: 'Performance', icon: <BarChart className="w-4 h-4" />, href: '/performance', category: 'Network', keywords: ['speed', 'latency'] },
  { id: 'cdn-caching', label: 'CDN Caching', icon: <Server className="w-4 h-4" />, href: '/cdn/caching', category: 'Network', keywords: ['cache', 'rules'] },
  { id: 'cdn-purge', label: 'Purge Cache', icon: <Server className="w-4 h-4" />, href: '/cdn/purge', category: 'Network', keywords: ['clear', 'invalidate'] },
  { id: 'dns', label: 'DNS Management', icon: <Globe className="w-4 h-4" />, href: '/dns', category: 'Network', keywords: ['records', 'domain'] },
  { id: 'ssl-tls', label: 'SSL/TLS Certificates', icon: <Lock className="w-4 h-4" />, href: '/ssl-tls', category: 'Network', keywords: ['https', 'certificate'] },
  
  // Account
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, href: '/settings', category: 'Account', keywords: ['preferences', 'config'] },
  { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, href: '/account/users', category: 'Account', keywords: ['team', 'roles'] },
  { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" />, href: '/account/api-keys', category: 'Account', keywords: ['token', 'integration'] },
  { id: 'siem', label: 'SIEM Logs', icon: <Database className="w-4 h-4" />, href: '/account/siem', category: 'Account', keywords: ['splunk', 'export'] },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: <HelpCircle className="w-4 h-4" />, href: '/troubleshooting', category: 'Account', keywords: ['debug', 'logs', 'help'] },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.category.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.includes(searchLower))
    );
  });

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle navigation
  const handleSelect = useCallback((cmd: CommandItem) => {
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action) {
      cmd.action();
    }
    setIsOpen(false);
  }, [router]);

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[15vh] z-50"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.entries(groupedCommands).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No results found for "{search}"
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {category}
                </div>
                {items.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${globalIndex === selectedIndex 
                          ? 'bg-imperva-blue text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <span className={globalIndex === selectedIndex ? 'text-white' : 'text-gray-400'}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1">{cmd.label}</span>
                      <ArrowRight className={`w-4 h-4 ${globalIndex === selectedIndex ? 'text-white' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
