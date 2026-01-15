'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  Shield, 
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronLeft,
  Zap,
  Settings,
  LucideIcon,
  X
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
  expandable?: boolean;
  children?: { id: string; label: string; href: string }[];
}

interface MenuGroup {
  section: string | null;
  items: MenuItem[];
}

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const menuItems: MenuGroup[] = [
  { 
    section: null, 
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Globe, href: '/' },
    ] 
  },
  { 
    section: null, 
    items: [
      { 
        id: 'security', 
        label: 'Security', 
        icon: Shield, 
        expandable: true, 
        children: [
          { id: 'security-dashboard', label: 'Security Dashboard', href: '/security-dashboard' },
          { id: 'policies', label: 'WAF Policies', href: '/policies' },
          { id: 'ip-management', label: 'IP Management', href: '/ip-management' },
          { id: 'bot-protection', label: 'Bot Protection', href: '/bot-protection' },
          { id: 'client-side', label: 'Client Side Protection', href: '/client-side' },
          { id: 'api-security', label: 'API Security', href: '/api-security' },
          { id: 'security-events', label: 'Security Events', href: '/security-events' },
        ]
      },
      { 
        id: 'performance', 
        label: 'Performance', 
        icon: Activity, 
        expandable: true, 
        children: [
          { id: 'performance-overview', label: 'Overview', href: '/performance' },
          { id: 'caching', label: 'CDN / Caching', href: '/cdn/caching' },
          { id: 'purge', label: 'Purge Cache', href: '/cdn/purge' },
          { id: 'network', label: 'Network', href: '/network' },
          { id: 'real-time', label: 'Real-Time', href: '/real-time' },
        ]
      },
      { 
        id: 'edge', 
        label: 'Edge', 
        icon: Zap, 
        expandable: true, 
        children: [
          { id: 'dns', label: 'DNS', href: '/dns' },
          { id: 'ssl-tls', label: 'SSL/TLS', href: '/ssl-tls' },
          { id: 'ddos', label: 'DDoS Protection', href: '/ddos-protection' },
        ]
      },
      { 
        id: 'analytics', 
        label: 'Analytics', 
        icon: AlertTriangle, 
        expandable: true, 
        children: [
          { id: 'attack-analytics', label: 'Attack Analytics', href: '/attack-analytics' },
          { id: 'attack-stories', label: 'Attack Stories (AI)', href: '/attack-stories' },
          { id: 'reputation', label: 'Reputation Intelligence', href: '/reputation' },
          { id: 'troubleshooting', label: 'Troubleshooting', href: '/troubleshooting' },
          { id: 'reports', label: 'Reports', href: '/reports' },
        ]
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings, 
        expandable: true, 
        children: [
          { id: 'users', label: 'Users & Roles', href: '/account/users' },
          { id: 'api-keys', label: 'API Keys', href: '/account/api-keys' },
          { id: 'siem', label: 'SIEM Logs', href: '/account/siem' },
          { id: 'general-settings', label: 'General Settings', href: '/settings' },
        ]
      },
    ] 
  },
];

export default function Sidebar({ activeMenu, onMenuChange, collapsed, onToggleCollapse, isMobileOpen, onMobileClose, onMouseEnter, onMouseLeave }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['waf']);
  const pathname = usePathname();

  const toggleExpand = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const isActive = (item: MenuItem) => {
    // For expandable menus, check if any child matches
    if (item.expandable && item.children) {
      return item.children.some(c => pathname === c.href);
    }
    // For direct links, exact match only
    if (item.href) {
      return pathname === item.href;
    }
    return false;
  };

  const isChildActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <aside 
        className={`
          ${collapsed ? 'w-16' : 'w-64'} 
          bg-white dark:bg-imperva-dark-sidebar h-screen flex-col transition-all duration-300 relative
          border-r border-gray-200 dark:border-transparent
          hidden lg:flex
          ${isMobileOpen ? '!flex fixed z-50 left-0 top-0' : ''}
        `}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button 
            onClick={onMobileClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Collapse Toggle - Desktop only */}
        <button 
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-imperva-dark-sidebar border border-gray-300 dark:border-gray-700 rounded-full items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white z-50 hidden lg:flex shadow-sm"
        >
        <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((group, groupIdx) => (
          <div key={groupIdx} className={collapsed ? 'mb-1' : 'mb-4'}>
            {group.section && !collapsed && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                {group.section}
              </div>
            )}
            {group.items.map((item) => (
              <div key={item.id}>
                {item.expandable ? (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={`w-full sidebar-item ${collapsed ? 'justify-center px-0' : ''} ${isActive(item) ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || '/'}
                    onClick={() => onMenuChange(item.id)}
                    className={`w-full sidebar-item ${collapsed ? 'justify-center px-0' : ''} ${isActive(item) ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-imperva-blue text-white rounded">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}
                
                {/* Children */}
                {item.children && expandedMenus.includes(item.id) && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={() => onMenuChange(child.id)}
                        className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                          pathname === child.href || activeMenu === child.id
                            ? 'bg-imperva-blue text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500">Copyright © 2024 Montara</p>
        </div>
      )}
    </aside>
    </>
  );
}
