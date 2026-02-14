'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface Feature {
  label: string;
  enabled: boolean;
}

interface PricingCardNewProps {
  name: string;
  title: string;
  description: string;
  price: number;
  period: string;
  originalPrice?: number;
  features: Feature[];
  isBadge?: boolean;
  badgeText?: string;
  badgeColor?: 'orange' | 'blue' | 'purple';
  isCurrentPlan?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
  isFeatured?: boolean;
}

const PricingCardNew: React.FC<PricingCardNewProps> = ({
  name,
  title,
  description,
  price,
  period,
  originalPrice,
  features,
  isBadge = false,
  badgeText = '',
  badgeColor = 'orange',
  isCurrentPlan = false,
  onSelect,
  isLoading = false,
  isFeatured = false,
}) => {
  const badgeColors = {
    orange: 'bg-gradient-to-r from-orange to-orange-light text-white',
    blue: 'bg-gradient-to-r from-blue to-blue-light text-white',
    purple: 'bg-gradient-to-r from-purple to-purple-light text-white',
  };

  const baseDelayMap: Record<string, number> = {
    free: 0.4,
    monthly: 0.5,
    annual: 0.6,
  };

  return (
    <div
      className={`relative rounded-3xl border-2 transition-all duration-300 animate-fadeInUp ${
        isFeatured
          ? 'border-orange bg-white shadow-2xl shadow-orange/20 scale-105 lg:scale-100'
          : isCurrentPlan
          ? 'border-blue bg-white shadow-2xl shadow-blue/20'
          : 'border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1'
      }`}
      style={{ animationDelay: `${baseDelayMap[name] || 0.4}s` }}
    >
      {/* Badge */}
      {isBadge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className={`${badgeColors[badgeColor]} px-4 py-1 rounded-full text-sm font-bold`}>
            {badgeText}
          </span>
        </div>
      )}

      <div className="p-10">
        {/* Title */}
        <h3 className="font-display text-3xl font-bold text-black mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 text-base">{description}</p>

        {/* Pricing */}
        <div className="mb-8">
          {name === 'free' ? (
            <>
              <span className="font-display text-5xl font-bold text-black">Free</span>
              <p className="text-gray-600 mt-2">Forever</p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold text-black">
                  ₦{price.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                {period}
                {originalPrice && (
                  <span className="ml-2 line-through text-gray-400">
                    ₦{originalPrice.toLocaleString()}
                  </span>
                )}
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange/10 flex items-center justify-center mt-0.5">
                <Check size={14} className="text-orange" />
              </span>
              <span className="text-gray-800">{feature.label}</span>
            </li>
          ))}
        </ul>

        {/* Button */}
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full bg-blue text-white font-semibold py-3 px-4 rounded-xl cursor-default hover:bg-blue-dark transition-colors"
          >
            Current Plan
          </button>
        ) : (
          <button
            onClick={onSelect}
            disabled={isLoading}
            className={`w-full font-semibold py-3 px-4 rounded-xl transition-all ${
              isFeatured
                ? 'bg-gradient-to-r from-orange to-orange-light text-white hover:shadow-2xl hover:shadow-orange/30 disabled:opacity-50'
                : 'bg-white text-black border-2 border-gray-200 hover:border-orange hover:bg-orange/5 disabled:opacity-50'
            }`}
          >
            {isLoading ? 'Processing...' : isFeatured ? 'Upgrade to Annual' : 'Choose Plan'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PricingCardNew;
