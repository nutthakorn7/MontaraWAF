'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ChevronRight, Maximize2, X, ExternalLink } from 'lucide-react';

interface TopWebsite {
  website: string;
  events: number;
  change: number;
}

interface TopAttackedWebsitesProps {
  websites: TopWebsite[];
}

export default function TopAttackedWebsites({ websites }: TopAttackedWebsitesProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const handleWebsiteClick = (website: string) => {
    // Navigate to security events page with website filter
    router.push(`/security-events?website=${encodeURIComponent(website)}`);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Attacked Websites</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">By Total Events ▼</p>
          </div>
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 text-sm transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Expand
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="pb-2 font-medium">Website</th>
              <th className="pb-2 font-medium text-right">Events</th>
            </tr>
          </thead>
          <tbody>
            {websites.slice(0, 5).map((site, idx) => (
              <tr 
                key={idx} 
                onClick={() => handleWebsiteClick(site.website)}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <td className="py-3">
                  <span className="text-sm text-imperva-blue hover:underline flex items-center gap-1 group">
                    {site.website}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatNumber(site.events)}
                    </span>
                    <span className="flex items-center gap-0.5 text-sm text-red-500">
                      <ArrowUp className="w-3 h-3" />
                      {site.change}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Attacked Websites</h2>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Website</th>
                    <th className="pb-2 font-medium text-right">Events</th>
                    <th className="pb-2 font-medium text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map((site, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => {
                        handleWebsiteClick(site.website);
                        setIsExpanded(false);
                      }}
                      className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="py-3 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="py-3">
                        <span className="text-sm text-imperva-blue hover:underline flex items-center gap-1 group">
                          {site.website}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatNumber(site.events)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="flex items-center justify-end gap-0.5 text-sm text-red-500">
                          <ArrowUp className="w-3 h-3" />
                          {site.change}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
