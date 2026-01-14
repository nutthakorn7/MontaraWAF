'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import StatsBar from '@/components/StatsBar';
import SecurityMetricCard from '@/components/SecurityMetricCard';
import SecurityEventsGraph from '@/components/SecurityEventsGraph';
import TopAttackedWebsites from '@/components/TopAttackedWebsites';
import WAFSecurityDashboard from '@/components/WAFSecurityDashboard';
import CountryEventsMap from '@/components/CountryEventsMap';
import WorldMap from '@/components/WorldMap';
import LiveEvents from '@/components/LiveEvents';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { 
  apiClient, 
  DashboardResponse, 
  SecurityDashboardResponse,
  CountryEvents 
} from '@/lib/api';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [securityData, setSecurityData] = useState<SecurityDashboardResponse | null>(null);
  const [countryEvents, setCountryEvents] = useState<CountryEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashRes, secRes, countryRes] = await Promise.all([
        apiClient.getDashboard(),
        apiClient.getSecurityDashboard(),
        apiClient.getCountryEvents(),
      ]);

      setDashboardData(dashRes);
      setSecurityData(secRes);
      setCountryEvents(countryRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to connect to API. Make sure the backend is running on port 8080.');
      
      // Fallback to mock data if API is down
      setDashboardData(getMockDashboardData());
      setSecurityData(getMockSecurityData());
      setCountryEvents(getMockCountryEvents());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mock data fallbacks
  function getMockDashboardData(): DashboardResponse {
    return {
      stats: [
        { label: 'Websites', value: '250', change: 0, changeLabel: '' },
        { label: 'Protected Networks', value: '34', change: 0, changeLabel: '' },
        { label: 'Protected IPs', value: '12', change: 0, changeLabel: '' },
        { label: 'DNS Zones', value: '12', change: 0, changeLabel: '' },
      ],
      security: [
        {
          label: 'WAF Violations',
          value: '32K',
          change: 23,
          subMetrics: [
            { label: 'Alerted events', value: '47K', color: '#FCD34D' },
            { label: 'Blocked events', value: '8.2K', color: '#EF4444' },
          ],
          links: ['View Dashboard'],
        },
        {
          label: 'Mitigated Bot attacks',
          value: '35K',
          change: 23,
          subMetrics: [
            { label: 'ATO', value: '10K', color: '#3B82F6' },
            { label: 'ABP', value: '25K', color: '#8B5CF6' },
          ],
          links: ['ATO', 'ABP', 'Client Classification'],
        },
        {
          label: 'DDoS Network attacks',
          value: '18',
          change: 23,
          subMetrics: [
            { label: 'Small', value: '2', color: '#F59E0B' },
            { label: 'Medium', value: '10', color: '#EF4444' },
            { label: 'Large', value: '4', color: '#DC2626' },
          ],
          links: ['Website DDoS (8)', 'Network DDoS (10)'],
        },
        {
          label: 'Incidents by Attack Analytics',
          value: '25',
          change: 23,
          subMetrics: [
            { label: 'Partially stacked', value: '5', color: '#F59E0B' },
            { label: 'Fully blocked', value: '20', color: '#10B981' },
          ],
          links: ['View Dashboard'],
        },
      ],
      timeSeries: generateTimeSeriesData(),
      topWebsites: [
        { website: 'www.site-name.com', events: 23000, change: 40 },
        { website: 'api.example.com', events: 18500, change: 35 },
        { website: 'app.company.co.th', events: 15200, change: 28 },
        { website: 'portal.business.com', events: 12800, change: 22 },
        { website: 'www.store.co.th', events: 9500, change: 15 },
      ],
    };
  }

  function getMockSecurityData(): SecurityDashboardResponse {
    return {
      distribution: {
        allRequests: '84.5K',
        requestsBlocked: '46.1K',
        wafSessions: '32.9K',
        allChange: -14,
        blockedChange: 22,
        sessionsChange: -20,
      },
      violationTypes: [
        { name: 'Bad Bots', value: 45.7, color: '#3B82F6' },
        { name: 'Illegal Resource Access', value: 30.8, color: '#8B5CF6' },
        { name: 'Cross-Site Scripting', value: 10, color: '#EC4899' },
        { name: 'SQL Injection', value: 5.8, color: '#F59E0B' },
        { name: 'Backdoor Protect', value: 7.7, color: '#EF4444' },
      ],
      securitySettings: [
        { type: 'Bad Bots', sessions: 667, currentSetting: 'Block request' },
        { type: 'Illegal Resource Access', sessions: 620, currentSetting: 'Block request' },
        { type: 'Cross-Site Scripting', sessions: 63, currentSetting: 'Block request' },
        { type: 'SQL Injection', sessions: 38, currentSetting: 'Block request' },
        { type: 'DDoS', sessions: 20, currentSetting: 'Ignored (Enable)' },
        { type: 'Backdoor Protect', sessions: 10, currentSetting: 'Block request' },
      ],
      topAttackers: [
        { ip: '1.2.3.4', country: 'CN', flag: '🇨🇳', attacks: 1543 },
        { ip: '5.6.7.8', country: 'RU', flag: '🇷🇺', attacks: 1232 },
        { ip: '9.10.11.12', country: 'US', flag: '🇺🇸', attacks: 890 },
      ],
      actionsBySource: [
        { name: 'IP Reputation', value: 45, color: '#EF4444' },
        { name: 'Bot Protection', value: 30, color: '#F59E0B' },
        { name: 'WAF Rules', value: 25, color: '#3B82F6' },
      ],
      attackTimeSeries: [
        { hour: '00:00', attacks: 120, blocked: 100 },
        { hour: '04:00', attacks: 80, blocked: 70 },
        { hour: '08:00', attacks: 250, blocked: 230 },
        { hour: '12:00', attacks: 400, blocked: 380 },
        { hour: '16:00', attacks: 300, blocked: 280 },
        { hour: '20:00', attacks: 200, blocked: 190 },
      ],
      triggeredPolicies: [
        { policy: 'SQL Injection Block', triggers: 1250, severity: 'high' },
        { policy: 'XSS Filter', triggers: 850, severity: 'medium' },
        { policy: 'Bad Bot Block', triggers: 600, severity: 'low' },
      ],
    };
  }

  function getMockCountryEvents(): CountryEvents[] {
    return [
      { country: 'USA', events: 5342 },
      { country: 'China', events: 4000 },
      { country: 'Israel', events: 3000 },
      { country: 'Others', events: 500 },
    ];
  }

  function generateTimeSeriesData() {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        wafEvents: Math.floor(Math.random() * 5000) + 1000,
        botAttacks: Math.floor(Math.random() * 2000) + 500,
        ddosAttacks: Math.floor(Math.random() * 500) + 100,
      });
    }
    return data;
  }

  if (loading) {
    return (
      <AppLayout activeMenu="dashboards">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeMenu="dashboards">
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Dashboard' }
        ]}
        actions={
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {error && (
              <span className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="w-4 h-4" />
                Using mock data
              </span>
            )}
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            <button onClick={fetchData} className="text-imperva-blue hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        }
      />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {dashboardData && securityData && (
            <>
              {/* Stats Bar */}
              <StatsBar 
                stats={dashboardData.stats.map(s => ({ label: s.label, value: s.value }))} 
                timeRange="Last 14 Days"
                onRefresh={fetchData}
              />

              {/* Security Section Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
                <a href="/security-events" className="text-sm text-imperva-blue hover:underline">Security Dashboard</a>
              </div>

              {/* Security Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {dashboardData.security.map((metric, idx) => (
                  <SecurityMetricCard
                    key={idx}
                    label={metric.label}
                    value={metric.value}
                    change={metric.change}
                    subMetrics={metric.subMetrics}
                    links={metric.links}
                  />
                ))}
              </div>

              {/* Security Events Graph & Top Attacked */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <SecurityEventsGraph data={dashboardData.timeSeries} />
                </div>
                <div>
                  <TopAttackedWebsites websites={dashboardData.topWebsites} />
                </div>
              </div>

              {/* WAF Violations Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <WAFSecurityDashboard
                  distribution={securityData.distribution}
                  securitySettings={{ violationTypes: securityData.securitySettings }}
                />
                <WorldMap data={countryEvents} title="Security Events by Country" />
              </div>

              {/* Live Events Section */}
              <div className="mb-6">
                <LiveEvents maxVisible={8} />
              </div>
            </>
          )}
        </main>
    </AppLayout>
  );
}
