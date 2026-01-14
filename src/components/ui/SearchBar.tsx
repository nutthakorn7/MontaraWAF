'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'page' | 'event' | 'policy' | 'ip';
  title: string;
  subtitle?: string;
  href: string;
}

const searchablePages: SearchResult[] = [
  { type: 'page', title: 'Dashboard', subtitle: 'Main overview', href: '/' },
  { type: 'page', title: 'Attack Analytics', subtitle: 'View attack patterns', href: '/attack-analytics' },
  { type: 'page', title: 'Security Events', subtitle: 'Real-time events', href: '/security-events' },
  { type: 'page', title: 'WAF Policies', subtitle: 'Manage rules', href: '/policies' },
  { type: 'page', title: 'API Security', subtitle: 'API inventory', href: '/api-security' },
  { type: 'page', title: 'Bot Protection', subtitle: 'Bot mitigation', href: '/bot-protection' },
  { type: 'page', title: 'Client-Side Protection', subtitle: 'Script security', href: '/client-side' },
  { type: 'page', title: 'SSL/TLS', subtitle: 'Certificate management', href: '/ssl-tls' },
  { type: 'page', title: 'Troubleshooting', subtitle: 'System diagnostics', href: '/troubleshooting' },
  { type: 'page', title: 'Reputation Intelligence', subtitle: 'IP reputation', href: '/reputation' },
  { type: 'page', title: 'Settings', subtitle: 'Application settings', href: '/settings' },
];

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchablePages.filter(
        (page) =>
          page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.subtitle?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const updated = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    router.push(result.href);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search</span>
        <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs bg-gray-700 rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, events, policies..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-500">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query && results.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Pages</div>
              {results.map((result) => (
                <button
                  key={result.href}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-gray-500">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent
              </div>
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => setQuery(search)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                </button>
              ))}
            </div>
          )}

          {!query && recentSearches.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
