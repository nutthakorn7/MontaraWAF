'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Globe, 
  Network, 
  Database, 
  ChevronDown,
  User,
  Sun,
  Moon,
  LogOut,
  Menu
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/components/ui/SearchBar';
import HelpDropdown from '@/components/ui/HelpDropdown';

interface HeaderProps {
  accountName: string;
  activeTab: 'home' | 'application' | 'network' | 'data';
  onTabChange: (tab: 'home' | 'application' | 'network' | 'data') => void;
  onMenuToggle?: () => void;
}

export default function Header({ accountName, activeTab, onTabChange, onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home, href: '/' },
    { id: 'application' as const, label: 'Application', icon: Globe, href: '/attack-analytics' },
    { id: 'network' as const, label: 'Network', icon: Network, href: '/security-events' },
    { id: 'data' as const, label: 'Data', icon: Database, href: '/reputation' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleTabClick = (tab: typeof tabs[number]) => {
    onTabChange(tab.id);
    router.push(tab.href);
  };

  return (
    <header className="h-14 bg-imperva-dark-header border-b border-gray-800 flex items-center px-4 relative">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-gray-400 hover:text-white mr-2"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-4 mr-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-white font-semibold text-lg">montara</span>
        </div>
        
        {/* Account Selector */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded text-sm text-gray-300 hover:bg-gray-700">
          <span className="text-xs text-gray-500">CURRENT ACCOUNT</span>
          <span className="font-medium text-white">{accountName}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === tab.href 
                ? 'bg-imperva-blue text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light</span>
            </>
          )}
        </button>

        {/* Search */}
        <SearchBar />

        {/* Help Dropdown */}
        <HelpDropdown />

        {/* Account / User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-2 py-1 rounded"
          >
            <User className="w-5 h-5" />
            <span className="text-sm">{user?.name || 'Account'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
