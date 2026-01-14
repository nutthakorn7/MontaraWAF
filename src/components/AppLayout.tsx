'use client';

import React, { useState, useRef, ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  activeMenu?: string;
}

export default function AppLayout({ children, activeMenu = 'dashboards' }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(activeMenu);
  const [activeTab, setActiveTab] = useState<'home' | 'application' | 'network' | 'data'>('application');
  
  // Track if sidebar was manually pinned open (via click)
  const isPinnedOpen = useRef(false);

  const handleToggleCollapse = () => {
    // Toggle pin state on manual click
    isPinnedOpen.current = sidebarCollapsed;
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMouseEnter = () => {
    // Only expand on hover if not already pinned open
    if (sidebarCollapsed && !isPinnedOpen.current) {
      setSidebarCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    // Only collapse on mouse leave if not pinned
    if (!isPinnedOpen.current) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="flex h-screen bg-imperva-bg-primary">
      <Sidebar
        activeMenu={currentMenu}
        onMenuChange={setCurrentMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          accountName="Your_Account_Name"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        
        {children}
      </div>
    </div>
  );
}
