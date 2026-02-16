'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CurrentPlanCard from '@/components/subscription/CurrentPlanCard';
import UsageStatsSection from '@/components/subscription/UsageStatsSection';
import BillingToggle from '@/components/subscription/BillingToggle';
import PricingCardNew from '@/components/subscription/PricingCardNew';
import FeatureComparisonTable from '@/components/subscription/FeatureComparisonTable';
import FAQSection from '@/components/subscription/FAQSection';

interface Plan {
  id: number;
  name: string;
  display_name: string;
  price: number;
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
}

interface CurrentSubscription {
  plan: {
    name: string;
    display_name: string;
    price: number;
  };
  renewal_date?: string;
}

const PricingPage: React.FC = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanLoading, setSelectedPlanLoading] = useState<number | null>(null);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [usageStats, setUsageStats] = useState<any[]>([]);

  // Fetch subscription plans and current subscription on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use backend API directly (assumes backend running on localhost:8000)
        const apiUrl = 'http://localhost:8000/api';

        console.log('Fetching subscription plans from:', apiUrl);
        const plansResponse = await fetch(`${apiUrl}/subscriptions/plans/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!plansResponse.ok) {
          throw new Error(`Failed to fetch subscription plans: ${plansResponse.status}`);
        }

        const plansData = await plansResponse.json();
        console.log('Plans response:', plansData);
        const sortedPlans = Array.isArray(plansData) ? plansData : plansData.results || [];
        console.log('Sorted plans:', sortedPlans);
        setPlans(sortedPlans.sort((a: Plan, b: Plan) => a.price - b.price));

        // Fetch current subscription if user is authenticated
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const subscriptionResponse = await fetch(`${apiUrl}/subscriptions/my-subscription/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (subscriptionResponse.ok) {
              const subscription = await subscriptionResponse.json();
              setCurrentPlan(subscription);

              // Fetch detailed status (includes feature usage)
              try {
                    const statusRes = await fetch(`${apiUrl}/subscriptions/my-subscription/status/`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (statusRes.ok) {
                  const statusData = await statusRes.json();
                  const usage = statusData.feature_usage || statusData.featureUsage || {};
                  // Transform to UI usage cards
                  const makePercent = (used: number, limit: number | null) => {
                    if (limit === 0 || limit === null) return Math.min(100, Math.round((used / 1000) * 100));
                    return Math.min(100, Math.round((used / limit) * 100));
                  };

                  const planForUser = subscription.plan || subscription.plan_details || null;

                  const stats = [
                    {
                      icon: '📝',
                      label: 'Questions Generated',
                      value: usage.questions_used_today ?? 0,
                      limit: planForUser ? (planForUser.questions_per_day === 0 ? 'Unlimited' : `${planForUser.questions_per_day}/day`) : '—',
                      percentage: makePercent(usage.questions_used_today ?? 0, planForUser ? planForUser.questions_per_day : null),
                      status: 'high' as const,
                    },
                    {
                      icon: '⏱️',
                      label: 'Mock Exams Taken',
                      value: usage.mock_exams_taken ?? 0,
                      limit: 'Unlimited',
                      percentage: makePercent(usage.mock_exams_taken ?? 0, null),
                      status: 'high' as const,
                    },
                    {
                      icon: '🤖',
                      label: 'AI Tutor Sessions',
                      value: usage.ai_tutor_sessions ?? 0,
                      limit: 'Unlimited',
                      percentage: makePercent(usage.ai_tutor_sessions ?? 0, null),
                      status: 'high' as const,
                    },
                    {
                      icon: '⏰',
                      label: 'Study Hours',
                      value: usage.study_sessions_this_month ?? 0,
                      limit: 'This Month',
                      percentage: makePercent(usage.study_sessions_this_month ?? 0, null),
                      status: 'medium' as const,
                    },
                  ];

                  setUsageStats(stats);
                }
              } catch (err) {
                console.warn('Failed to fetch subscription status:', err);
              }
            }
          } catch (err) {
            console.error('Failed to fetch current subscription:', err);
          }
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pricing');
        console.error('Error fetching pricing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPlan = async (planId: number) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('No authentication token found. Please log in again.');
      router.push('/auth/login?next=/dashboard/pricing');
      return;
    }

    try {
      setSelectedPlanLoading(planId);
      console.log('Token:', token.substring(0, 20) + '...');

      const selectedPlan = plans.find((p) => p.id === planId);
      if (!selectedPlan) return;

      const apiUrl = 'http://localhost:8000/api';

      if (selectedPlan.name === 'free') {
        // Free tier - direct subscription
        console.log('Subscribing to free plan with token:', token.substring(0, 20) + '...');
        const response = await fetch(`${apiUrl}/subscriptions/my-subscription/subscribe/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            plan_id: planId,
            enable_auto_renew: true,
          }),
        });

        console.log('Subscribe response status:', response.status);
        const responseText = await response.text();
        console.log('Subscribe response text:', responseText);

        if (!response.ok) {
          const errorData = responseText ? JSON.parse(responseText) : {};
          throw new Error(`Failed to subscribe to free plan: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = JSON.parse(responseText);
        setCurrentPlan(data);
        setError(null);
        // Show success message
        alert('Successfully subscribed to Free plan!');
        router.push('/dashboard');
      } else {
        // Paid tier - initiate payment
        const response = await fetch(`${apiUrl}/subscriptions/my-subscription/initiate-payment/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: planId,
            email: localStorage.getItem('user_email') || '',
            enable_auto_renew: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate payment');
        }

        const data = await response.json();

        // Store payment info for verification
        sessionStorage.setItem('paystack_reference', data.paystack_reference);
        sessionStorage.setItem('plan_id', planId.toString());

        // Redirect to Paystack
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process plan selection');
      console.error('Error selecting plan:', err);
    } finally {
      setSelectedPlanLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          <p className="mt-4 text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  // Build feature list for a single plan from its fields
  const buildFeatures = (plan: Plan) => {
    return [
      { label: plan.questions_per_day === 0 ? 'Unlimited questions' : `${plan.questions_per_day} questions/day`, enabled: true },
      { label: 'Mock Exams', enabled: !!plan.has_mock_exams },
      { label: 'AI Tutor', enabled: !!plan.has_ai_tutor },
      { label: 'Audio Mode', enabled: !!plan.has_audio_mode },
      { label: 'Document Analysis', enabled: !!plan.has_document_mode },
      { label: 'Offline Mode', enabled: !!plan.has_offline_mode },
      { label: 'Premium Content', enabled: !!plan.has_premium_content },
      { label: 'Priority Support', enabled: !!plan.has_priority_support },
    ];
  };

  // usageStats will be populated from the backend status endpoint

  // Build comparison features dynamically from plans data
  const generateComparisonFeatures = (plansList: Plan[]) => {
    const features = [
      'Questions per day',
      'Mock exams',
      'AI Tutor access',
      'Advanced analytics',
      'Offline mode',
      'Premium content',
      'Parent dashboard',
      'Priority support',
    ];

    return features.map((featureName) => {
      const values: Record<string, boolean | string> = {};
      plansList.forEach((p) => {
        switch (featureName) {
          case 'Questions per day':
            values[p.name] = p.questions_per_day === 0 ? 'Unlimited' : `${p.questions_per_day}`;
            break;
          case 'Mock exams':
            values[p.name] = !!p.has_mock_exams;
            break;
          case 'AI Tutor access':
            values[p.name] = !!p.has_ai_tutor;
            break;
          case 'Advanced analytics':
            values[p.name] = !!p.has_priority_support || !!p.has_premium_content || false;
            break;
          case 'Offline mode':
            values[p.name] = !!p.has_offline_mode;
            break;
          case 'Premium content':
            values[p.name] = !!p.has_premium_content;
            break;
          case 'Parent dashboard':
            values[p.name] = !!p.has_premium_content && p.name === 'annual';
            break;
          case 'Priority support':
            values[p.name] = !!p.has_priority_support;
            break;
          default:
            values[p.name] = false;
        }
      });

      return { name: featureName, values };
    });
  };

  // FAQ items
  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the charges.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including card payments, bank transfers, and mobile money (MTN, Airtel).',
    },
    {
      question: 'Is there a money-back guarantee?',
      answer: 'Annual plans come with a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel anytime. You\'ll continue to have access until the end of your billing period, and no future charges will be made.',
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'We offer group discounts for schools and tutorial centers. Contact our support team for institutional pricing.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'Your data is retained for 90 days after cancellation. You can reactivate your account anytime during this period.',
    },
  ];

  const currentPlanData = currentPlan?.plan;
  const renewalDate = currentPlan?.renewal_date || 'March 15, 2026';

  const comparisonFeatures = generateComparisonFeatures(plans);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 animate-fadeInUp">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-black mb-3">
            Pricing & Subscription
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your learning goals
          </p>
        </div>

        {/* Current Plan Section - Only show if user has active subscription */}
        {currentPlanData && (
          <CurrentPlanCard
            planName={currentPlanData.display_name || 'Monthly Plan'}
            price={currentPlanData.price || 2500}
            renewalDate={renewalDate}
            onUpgrade={() => {}}
            onCancel={() => {}}
          />
        )}

        {/* Usage Stats Section - Only show if user has active subscription */}
        {currentPlanData && <UsageStatsSection stats={usageStats} />}

        {/* Billing Toggle */}
        <BillingToggle isAnnual={isAnnualBilling} onToggle={setIsAnnualBilling} />

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <PricingCardNew
              key={plan.id}
              name={plan.name}
              title={plan.display_name.split('(')[0].trim()}
              description={
                plan.name === 'free'
                  ? 'Perfect for trying out PrepGenius'
                  : plan.name === 'monthly'
                  ? 'Best for focused exam prep'
                  : plan.name === 'quarterly'
                  ? 'Great value for 3 months'
                  : 'Save 33% with annual billing'
              }
              price={plan.price}
              period={
                plan.name === 'free'
                  ? 'forever'
                  : plan.name === 'monthly'
                  ? 'per month'
                  : plan.name === 'quarterly'
                  ? 'per quarter'
                  : 'per year'
              }
              originalPrice={plan.name === 'annual' ? 30000 : undefined}
              features={buildFeatures(plan)}
              isBadge={plan.name !== 'free'}
              badgeText={
                currentPlanData?.name === plan.name
                  ? 'CURRENT PLAN'
                  : plan.name === 'annual'
                  ? 'BEST VALUE'
                  : ''
              }
              badgeColor={currentPlanData?.name === plan.name ? 'blue' : 'orange'}
              isCurrentPlan={currentPlanData?.name === plan.name}
              onSelect={() => handleSelectPlan(plan.id)}
              isLoading={selectedPlanLoading === plan.id}
              isFeatured={plan.name === 'annual'}
            />
          ))}
        </div>

        {/* Feature Comparison Table */}
        <FeatureComparisonTable
          plans={plans.map((p) => ({ name: p.name, display_name: p.display_name }))}
          features={comparisonFeatures}
        />

        {/* FAQ Section */}
        <div className="mt-16">
          <FAQSection faqs={faqs} />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
