'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { Badge } from '@/components/ui';
import { Sparkles, Shield, Clock, Target, ChevronRight, AlertTriangle, Globe, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { apiClient, AttackStory } from '@/lib/api';

export default function AttackStoriesPage() {
  const [selectedStory, setSelectedStory] = useState<AttackStory | null>(null);
  const [stories, setStories] = useState<AttackStory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAttackStories();
      setStories(data);
    } catch (error) {
      console.error('Failed to fetch attack stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const statusColors: Record<string, string> = {
    active: 'bg-red-500',
    mitigated: 'bg-green-500',
    resolved: 'bg-blue-500',
  };

  return (
    <AppLayout activeMenu="attack-stories">
      {/* Header with breadcrumb */}
      <div className="breadcrumb-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">Analytics</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Attack Stories</span>
          <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3" />} className="ml-2">
            AI-Powered
          </Badge>
        </div>
        <button 
          onClick={fetchStories}
          className="btn-ghost"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

        <main className="flex-1 overflow-y-auto p-6">
          {/* AI Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300">AI-Powered Attack Analysis</p>
                <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                  Attack Stories uses machine learning to correlate security events, identify attack patterns, 
                  and provide actionable recommendations to improve your security posture.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stories List */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Attack Stories</h3>
                {stories.map(story => (
                  <div 
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className={`bg-white rounded-xl p-5 shadow-card cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${
                      selectedStory?.id === story.id ? 'ring-2 ring-imperva-blue' : ''
                    } ${story.severity === 'critical' ? 'border-red-200' : story.severity === 'high' ? 'border-orange-200' : story.severity === 'medium' ? 'border-yellow-200' : 'border-green-200'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${statusColors[story.status] || 'bg-gray-400'}`} />
                        <h4 className="text-base font-medium text-gray-900">{story.title}</h4>
                      </div>
                      <Badge 
                        variant={story.severity === 'critical' ? 'error' : story.severity === 'high' ? 'warning' : story.severity === 'medium' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {story.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{story.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.duration}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {story.affected_ips} IPs</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {story.attack_types?.join(', ')}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Story Detail */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Story Details</h3>
                {selectedStory ? (
                  <div className="bg-white rounded-xl p-5 shadow-card space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${statusColors[selectedStory.status] || 'bg-gray-400'}`} />
                      <span className="text-sm font-medium capitalize">{selectedStory.status}</span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedStory.title}</h4>
                      <Badge 
                        variant={selectedStory.severity === 'critical' ? 'error' : selectedStory.severity === 'high' ? 'warning' : selectedStory.severity === 'medium' ? 'warning' : 'success'}
                        size="sm"
                        className="mt-2"
                      >
                        {selectedStory.severity} severity
                      </Badge>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Attack Types</p>
                          <p className="text-sm text-gray-900">{selectedStory.attack_types?.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Affected IPs</p>
                          <p className="text-sm text-gray-900">{selectedStory.affected_ips}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Target URLs</p>
                          <p className="text-sm text-gray-900">{selectedStory.target_urls?.join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <p className="text-sm font-medium text-gray-900">AI Analysis</p>
                      </div>
                      <p className="text-sm text-gray-600">{selectedStory.summary}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <p className="text-sm font-medium text-gray-900">AI Insights</p>
                      </div>
                      <ul className="space-y-1">
                        {selectedStory.ai_insights?.map((insight, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500">•</span> {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-5 shadow-card text-center">
                    <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Select an attack story to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
    </AppLayout>
  );
}
