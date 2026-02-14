'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, X } from 'lucide-react';

interface SubscriptionStatusProps {
  displayMode?: 'full' | 'compact' | 'badge';
}

interface SubscriptionData {
  user_subscription: {
    plan: string;
    plan_name: string;
    status: string;
    is_active: boolean;
    days_remaining: number | null;
    expires_at: string | null;
    started_at: string;
    auto_renew: boolean;
  };
  feature_usage: {
    questions_used_today: number;
    study_sessions_this_month: number;
  };
  has_active_subscription: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  displayMode = 'full',
}) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          setError('Please log in to view your subscription.');
          return;
        }

        console.log('Fetching subscription status from /api/subscriptions/my-subscription/status/');
        console.log('Token being used:', token ? `${token.substring(0, 15)}...` : 'No token');

        try {
          const response = await fetch('/api/subscriptions/my-subscription/status', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            // signal: controller.signal, // Removed signal
          });

          // clearTimeout(timeoutId); // Removed timeout

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired or invalid
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              setError('Your session has expired. Please log in again.');
              setLoading(false);
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setSubscription(data);
          setError(null);
        } catch (fetchError) {
          // clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        if (err instanceof Error) {
          console.error('Error name:', err.name);
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }

        // Check if it's a 401 Unauthorized error
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError('Unable to connect to server. Please check your connection.');
        } else if (err instanceof Error) {
          // Check for common error patterns
          const errorMessage = err.message;
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            setError('Your session has expired. Please log in again.');
            // Optionally redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            }
          } else if (errorMessage.includes('Failed to fetch')) {
            setError('Unable to connect to server. Please try again.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Failed to load subscription');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const isFree = subscription.user_subscription.plan === 'free';
  const isActive = subscription.user_subscription.is_active;
  const daysRemaining = subscription.user_subscription.days_remaining;

  // Badge Mode
  if (displayMode === 'badge') {
    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}
      >
        {isActive ? (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            {subscription.user_subscription.plan_name}
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 mr-1" />
            {subscription.user_subscription.status}
          </>
        )}
      </div>
    );
  }

  // Compact Mode
  if (displayMode === 'compact') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-lg font-semibold text-gray-900">
              {subscription.user_subscription.plan_name}
            </p>
          </div>
          {!isFree && daysRemaining !== null && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className="text-2xl font-bold text-blue-600">{daysRemaining}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full Mode
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${isActive ? 'bg-green-50 border-b border-green-200' : 'bg-gray-50 border-b border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isActive ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscription.user_subscription.plan_name}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
              }`}
          >
            {subscription.user_subscription.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Plan Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Subscription Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Started</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(subscription.user_subscription.started_at).toLocaleDateString()}
              </p>
            </div>
            {!isFree && subscription.user_subscription.expires_at && (
              <div>
                <p className="text-xs text-gray-600">Expires</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(subscription.user_subscription.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {!isFree && daysRemaining !== null && (
              <div>
                <p className="text-xs text-gray-600">Days Remaining</p>
                <p className={`text-sm font-semibold ${daysRemaining < 7 ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {daysRemaining} days
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600">Auto-Renewal</p>
              <p className="text-sm font-semibold text-gray-900">
                {subscription.user_subscription.auto_renew ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage This Month</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs  text-gray-600">Questions Used Today</p>
                <p className="text-sm font-semibold text-gray-900">
                  {subscription.feature_usage.questions_used_today}
                </p>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (subscription.feature_usage.questions_used_today / 10) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600">Study Sessions This Month</p>
                <p className="text-sm font-semibold text-gray-900">
                  {subscription.feature_usage.study_sessions_this_month}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4 flex space-x-3">
          <a
            href="/pricing"
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-center"
          >
            Upgrade Plan
          </a>
          {!isFree && (
            <button className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors">
              Cancel Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
