'use client';

import React from 'react';
import { ArrowRight, X } from 'lucide-react';

interface CurrentPlanCardProps {
  planName: string;
  price: number;
  renewalDate: string;
  onUpgrade: () => void;
  onCancel: () => void;
}

const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  planName,
  price,
  renewalDate,
  onUpgrade,
  onCancel,
}) => {
  return (
    <div className="relative bg-gradient-to-r from-blue to-blue-light rounded-3xl p-10 text-white mb-12 overflow-hidden animate-fadeInUp">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-white/15 to-transparent rounded-full blur-3xl -mr-48 -mt-48"></div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left side - Plan info */}
        <div>
          <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
            CURRENT PLAN
          </span>
          <h2 className="font-display text-4xl font-bold mb-4">{planName}</h2>
          <div className="mb-4">
            <span className="font-display text-6xl font-bold">₦{price.toLocaleString()}</span>
            <span className="text-white/90 ml-2 text-lg">/month</span>
          </div>
          <p className="text-white/90">Renews on {renewalDate}</p>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onUpgrade}
            className="bg-white text-blue font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Upgrade Plan
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onCancel}
            className="border-2 border-white text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/10 transition-all"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentPlanCard;
