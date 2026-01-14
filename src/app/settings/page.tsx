'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Globe, 
  Save,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('settings');
  const [activeTab, setActiveTab] = useState<'home' | 'application' | 'network' | 'data'>('application');
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { info, success, error: showError } = useToast();

  // Form states
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@montara.com',
    company: 'Montara Security',
    timezone: 'Asia/Bangkok',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    securityEvents: true,
    weeklyReport: true,
    criticalOnly: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    ipWhitelist: '',
  });

  const handleSave = () => {
    setSaved(true);
    success('Saved', 'Settings saved successfully');
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="flex h-screen bg-imperva-bg-primary dark:bg-gray-900">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          accountName="Your_Account_Name"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

            <div className="flex gap-6">
              {/* Sidebar Navigation */}
              <div className="w-48 flex-shrink-0">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full tab-btn justify-start ${
                        activeSection === section.id
                          ? 'tab-btn-active'
                          : 'tab-btn-inactive'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 card-container p-6">
                {/* Profile Section */}
                {activeSection === 'profile' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select
                          value={profile.timezone}
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                        >
                          <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York (UTC-5)</option>
                          <option value="Europe/London">Europe/London (UTC+0)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                      {[
                        { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
                        { key: 'securityEvents', label: 'Security Events', desc: 'Get notified about security incidents' },
                        { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly security summary' },
                        { key: 'criticalOnly', label: 'Critical Only', desc: 'Only notify for critical events' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.desc}</div>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              notifications[item.key as keyof typeof notifications] ? 'bg-imperva-blue' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                              theme === 'light' ? 'border-imperva-blue bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="w-full h-20 bg-white rounded border border-gray-200 mb-2" />
                            <div className="text-sm font-medium">Light</div>
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                              theme === 'dark' ? 'border-imperva-blue bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="w-full h-20 bg-gray-800 rounded mb-2" />
                            <div className="text-sm font-medium">Dark</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-500">Add extra security to your account</div>
                        </div>
                        <button
                          onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            security.twoFactor ? 'bg-imperva-blue' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            security.twoFactor ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IP Whitelist</label>
                        <textarea
                          value={security.ipWhitelist}
                          onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })}
                          placeholder="Enter IP addresses, one per line"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imperva-blue focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations Section */}
                {activeSection === 'integrations' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h2>
                    <div className="space-y-4">
                      {[
                        { name: 'Slack', desc: 'Send alerts to Slack channels', connected: true },
                        { name: 'PagerDuty', desc: 'Trigger PagerDuty incidents', connected: false },
                        { name: 'Splunk', desc: 'Forward logs to Splunk', connected: true },
                        { name: 'AWS CloudWatch', desc: 'Send metrics to CloudWatch', connected: false },
                      ].map((integration) => (
                        <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">{integration.name}</div>
                            <div className="text-sm text-gray-500">{integration.desc}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (integration.connected) {
                                showError('Disconnecting', `Disconnecting ${integration.name}...`);
                              } else {
                                success('Connecting', `Connecting to ${integration.name}...`);
                              }
                            }}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              integration.connected
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {integration.connected ? 'Connected' : 'Connect'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-imperva-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  {saved && (
                    <span className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      Settings saved successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
