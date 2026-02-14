'use client';

import React from 'react';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

const BillingToggle: React.FC<BillingToggleProps> = ({ isAnnual, onToggle }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mb-12 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(false)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            !isAnnual
              ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-lg shadow-orange/30'
              : 'bg-white text-black border-2 border-transparent hover:border-orange'
          }`}
        >
          Monthly Billing
        </button>
        
        <span className="text-gray-400">|</span>
        
        <button
          onClick={() => onToggle(true)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            isAnnual
              ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-lg shadow-orange/30'
              : 'bg-white text-black border-2 border-transparent hover:border-orange'
          }`}
        >
          Annual Billing
          {isAnnual && (
            <span className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              SAVE 33%
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default BillingToggle;
