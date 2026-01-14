'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Shield, Bot, RefreshCw } from 'lucide-react';

interface BotRule {
  id: string;
  pattern: string;
  type: 'block' | 'allow' | 'challenge';
  category: 'crawler' | 'scraper' | 'attack_tool' | 'automation' | 'good_bot';
  enabled: boolean;
  hitCount: number;
}

export default function BotRulesManager() {
  const [rules, setRules] = useState<BotRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // New rule form
  const [newRule, setNewRule] = useState({
    pattern: '',
    type: 'block' as const,
    category: 'automation' as const,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch('/api/v1/edge/bot/rules');
      const data = await res.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  }

  async function addRule() {
    try {
      const res = await fetch('/api/v1/edge/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', rule: { ...newRule, enabled: true } }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewRule({ pattern: '', type: 'block', category: 'automation' });
        fetchRules();
      }
    } catch (error) {
      console.error('Failed to add rule');
    }
  }

  async function toggleRule(id: string, enabled: boolean) {
    try {
      await fetch('/api/v1/edge/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, updates: { enabled } }),
      });
      fetchRules();
    } catch (error) {
      console.error('Failed to update rule');
    }
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this rule?')) return;
    try {
      await fetch(`/api/v1/edge/bot?id=${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (error) {
      console.error('Failed to delete rule');
    }
  }

  const filteredRules = filter === 'all' 
    ? rules 
    : rules.filter(r => r.category === filter || r.type === filter);

  const categories = ['all', 'attack_tool', 'automation', 'crawler', 'scraper', 'good_bot'];
  const typeColors = {
    block: 'bg-red-500/20 text-red-400 border-red-500/30',
    allow: 'bg-green-500/20 text-green-400 border-green-500/30',
    challenge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Bot Rules</h2>
          <p className="text-gray-400">{rules.length} rules configured</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Rule</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pattern (User-Agent)</label>
              <input
                type="text"
                value={newRule.pattern}
                onChange={e => setNewRule({ ...newRule, pattern: e.target.value })}
                placeholder="e.g. BadBot*"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Action</label>
              <select
                value={newRule.type}
                onChange={e => setNewRule({ ...newRule, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="block">Block</option>
                <option value="allow">Allow</option>
                <option value="challenge">Challenge</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={newRule.category}
                onChange={e => setNewRule({ ...newRule, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="automation">Automation</option>
                <option value="crawler">Crawler</option>
                <option value="scraper">Scraper</option>
                <option value="attack_tool">Attack Tool</option>
                <option value="good_bot">Good Bot</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={addRule}
              disabled={!newRule.pattern}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              Add Rule
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Pattern</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Hits</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map(rule => (
              <tr key={rule.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-mono text-sm">{rule.pattern}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-300 text-sm capitalize">{rule.category.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${typeColors[rule.type]}`}>
                    {rule.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-400 text-sm">{rule.hitCount}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRule(rule.id, !rule.enabled)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      rule.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
