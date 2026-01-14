'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';

interface CountryEvent {
  country: string;
  events: number;
}

interface CountryEventsMapProps {
  data: CountryEvent[];
}

export default function CountryEventsMap({ data }: CountryEventsMapProps) {
  return (
    <div className="bg-white rounded-lg shadow-card h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Security Events by Country</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5">
        {/* Simple World Map Placeholder */}
        <div className="relative h-48 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
          <svg viewBox="0 0 800 400" className="w-full h-full opacity-30">
            {/* Simplified world map paths */}
            <ellipse cx="400" cy="200" rx="350" ry="150" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
            <circle cx="200" cy="150" r="8" fill="#3b82f6" opacity="0.8"/>
            <circle cx="450" cy="120" r="5" fill="#3b82f6" opacity="0.6"/>
            <circle cx="550" cy="180" r="6" fill="#3b82f6" opacity="0.7"/>
            <circle cx="380" cy="220" r="4" fill="#3b82f6" opacity="0.5"/>
          </svg>
          <span className="absolute text-sm text-gray-400">World Map View</span>
        </div>

        {/* Country List */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
              <th className="pb-2 font-medium">Country</th>
              <th className="pb-2 font-medium text-right">Events</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 text-gray-900">{item.country}</td>
                <td className="py-2 text-right font-medium text-gray-900">
                  {item.events.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
