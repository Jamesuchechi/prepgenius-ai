'use client';

import React from 'react';

interface UsageCard {
  icon: string;
  label: string;
  value: string | number;
  limit: string;
  percentage: number;
  status: 'high' | 'medium' | 'low';
}

interface UsageStatsSectionProps {
  stats: UsageCard[];
}

const UsageStatsSection: React.FC<UsageStatsSectionProps> = ({ stats }) => {
  const getBarGradient = (status: 'high' | 'medium' | 'low') => {
    switch (status) {
      case 'high':
        return 'bg-gradient-to-r from-green-400 to-emerald-400';
      case 'medium':
        return 'bg-gradient-to-r from-orange to-orange-light';
      case 'low':
        return 'bg-gradient-to-r from-red-400 to-red-300';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="mb-12 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
      <h2 className="font-display text-3xl font-bold text-black mb-8">Your Usage This Month</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-orange transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
            
            <div className="font-display text-4xl font-bold text-black mb-1">
              {stat.value}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">of {stat.limit}</p>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-gray rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarGradient(stat.status)}`}
                style={{ width: `${stat.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageStatsSection;
