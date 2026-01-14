'use client';

import AppLayout from '@/components/AppLayout';
import BotRulesManager from '@/components/bot/BotRulesManager';

export default function BotRulesPage() {
  return (
    <AppLayout activeMenu="bot-protection">
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Security</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Bot Protection</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Rules</span>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-6">
        <BotRulesManager />
      </main>
    </AppLayout>
  );
}
