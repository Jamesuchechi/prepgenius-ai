'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PricingCardProps {
  plan: {
    id: number;
    name: string;
    display_name: string;
    price: number | string;
    duration_days: number;
    features: string[];
    has_mock_exams: boolean;
    has_ai_tutor: boolean;
    has_audio_mode: boolean;
    has_document_mode: boolean;
    has_offline_mode: boolean;
    has_premium_content: boolean;
    has_priority_support: boolean;
    questions_per_day: number;
    description?: string;
  };
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: number) => void;
  isLoading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isCurrentPlan = false,
  onSelectPlan,
  isLoading = false,
}) => {
  const features = [
    { label: 'Questions per day', value: plan.questions_per_day === 0 ? 'Unlimited' : `${plan.questions_per_day}/day` },
    { label: 'Mock Exams', enabled: plan.has_mock_exams },
    { label: 'AI Tutor', enabled: plan.has_ai_tutor },
    { label: 'Audio Mode', enabled: plan.has_audio_mode },
    { label: 'Document Analysis', enabled: plan.has_document_mode },
    { label: 'Offline Mode', enabled: plan.has_offline_mode },
    { label: 'Premium Content', enabled: plan.has_premium_content },
    { label: 'Priority Support', enabled: plan.has_priority_support },
  ];

  const isFree = plan.name === 'free';
  const isHighlighted = plan.name === 'annual';

  return (
    <div
      className={`relative rounded-lg border transition-all duration-300 ${
        isHighlighted
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:shadow-lg'
      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
    >
      {isHighlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Current Plan
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.display_name}</h3>

        {/* Price */}
        <div className="mb-6">
          {isFree ? (
            <div>
              <span className="text-4xl font-bold text-gray-900">Free</span>
              <p className="text-gray-600 mt-2">Get started with PrepGenius</p>
            </div>
          ) : (
            <div>
              <span className="text-4xl font-bold text-gray-900">₦{Number(plan.price).toLocaleString()}</span>
              <p className="text-gray-600 mt-2">
                {plan.duration_days === 30
                  ? 'per month'
                  : plan.duration_days === 90
                  ? 'per 3 months'
                  : 'per year'}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onSelectPlan(plan.id)}
          disabled={isLoading || (isCurrentPlan && !isFree)}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 mb-8 ${
            isCurrentPlan && !isFree
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : isFree
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : isHighlighted
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } ${isLoading ? 'opacity-75' : ''}`}
        >
          {isLoading
            ? 'Processing...'
            : isCurrentPlan && !isFree
            ? 'Your Current Plan'
            : isFree
            ? 'Downgrade to Free'
            : 'Choose Plan'}
        </button>

        {/* Features List */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-700 uppercase">What's Included</p>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              {typeof feature === 'object' && 'enabled' in feature ? (
                feature.enabled ? (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                )
              ) : (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-gray-700">
                  {'enabled' in feature
                    ? feature.label
                    : feature.label}
                </p>
                {'value' in feature && feature.value && (
                  <p className="text-xs text-gray-500">{feature.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
