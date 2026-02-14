'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface Plan {
  name: string;
  display_name: string;
}

interface Feature {
  name: string;
  values: Record<string, boolean | string>;
}

interface FeatureComparisonTableProps {
  plans: Plan[];
  features: Feature[];
}

const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> =({ plans, features }) => {
  return (
    <div className="bg-white rounded-3xl p-10 border-2 border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
      <h2 className="font-display text-3xl font-bold text-black mb-8">Feature Comparison</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left py-4 px-4 font-display font-bold text-black w-2/5">Feature</th>
              {plans.map((plan) => (
                <th
                  key={plan.name}
                  className="text-center py-4 px-4 font-display font-bold text-black"
                >
                  {plan.display_name}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {features.map((feature, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 text-black font-medium">{feature.name}</td>
                
                {plans.map((plan) => {
                  const value = feature.values[plan.name];
                  const isString = typeof value === 'string';
                  
                  return (
                    <td key={plan.name} className="py-4 px-4 text-center">
                      {isString ? (
                        <span className="text-gray-800 font-medium">{value}</span>
                      ) : value ? (
                        <Check className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-gray-300 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeatureComparisonTable;
