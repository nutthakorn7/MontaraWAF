'use client';

import { Suspense } from 'react';
import DDoSMonitor from '@/components/ddos/DDoSMonitor';

export default function DDoSProtectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">DDoS Protection</h1>
            <p className="text-gray-400">Real-time attack monitoring and mitigation</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors">
              Challenge Mode
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Block All
            </button>
          </div>
        </div>

        {/* DDoS Monitor */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <DDoSMonitor />
        </Suspense>
      </div>
    </div>
  );
}
