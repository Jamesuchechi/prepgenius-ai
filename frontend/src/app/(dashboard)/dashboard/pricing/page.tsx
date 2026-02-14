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
  plan: number;
  plan_details: Plan;
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
      // Redirect to login
      router.push('/auth/login?next=/dashboard/pricing');
      return;
    }

    try {
      setSelectedPlanLoading(planId);

      const selectedPlan = plans.find((p) => p.id === planId);
      if (!selectedPlan) return;

      const apiUrl = 'http://localhost:8000/api';

      if (selectedPlan.name === 'free') {
        // Free tier - direct subscription
        const response = await fetch(`${apiUrl}/subscriptions/my-subscription/subscribe/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: planId,
            enable_auto_renew: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to subscribe to free plan');
        }

        const data = await response.json();
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

  // Build feature lists for pricing cards
  const buildFeatures = (plan: Plan) => {
    const featuresMap: Record<string, { label: string; enabled: boolean }[]> = {
      free: [
        { label: '10 questions per day', enabled: true },
        { label: 'Basic progress tracking', enabled: true },
        { label: '1 subject selection', enabled: true },
        { label: 'Community support', enabled: true },
        { label: 'Basic analytics', enabled: true },
      ],
      monthly: [
        { label: 'Unlimited questions', enabled: true },
        { label: 'All subjects & exam types', enabled: true },
        { label: 'Unlimited mock exams', enabled: true },
        { label: '24/7 AI tutor access', enabled: true },
        { label: 'Advanced analytics', enabled: true },
        { label: 'Priority support', enabled: true },
      ],
      quarterly: [
        { label: 'Unlimited questions', enabled: true },
        { label: 'All subjects & exam types', enabled: true },
        { label: 'Unlimited mock exams', enabled: true },
        { label: '24/7 AI tutor access', enabled: true },
        { label: 'Advanced analytics', enabled: true },
        { label: 'Priority support', enabled: true },
      ],
      annual: [
        { label: 'Everything in Monthly', enabled: true },
        { label: 'Offline study mode', enabled: true },
        { label: 'Premium content library', enabled: true },
        { label: 'Parent dashboard', enabled: true },
        { label: 'Personalized coaching', enabled: true },
        { label: 'Money-back guarantee', enabled: true },
      ],
    };

    return featuresMap[plan.name] || [];
  };

  // Usage stats mock data
  const usageStats = [
    {
      icon: '📝',
      label: 'Questions Generated',
      value: 847,
      limit: 'Unlimited',
      percentage: 85,
      status: 'high' as const,
    },
    {
      icon: '⏱️',
      label: 'Mock Exams Taken',
      value: 12,
      limit: 'Unlimited',
      percentage: 70,
      status: 'high' as const,
    },
    {
      icon: '🤖',
      label: 'AI Tutor Sessions',
      value: 28,
      limit: 'Unlimited',
      percentage: 60,
      status: 'high' as const,
    },
    {
      icon: '⏰',
      label: 'Study Hours',
      value: '24h',
      limit: 'This Month',
      percentage: 45,
      status: 'medium' as const,
    },
  ];

  // Comparison table data
  const comparisonFeatures = [
    {
      name: 'Questions per day',
      values: {
        free: '10',
        monthly: 'Unlimited',
        quarterly: 'Unlimited',
        annual: 'Unlimited',
      },
    },
    {
      name: 'Mock exams',
      values: {
        free: false,
        monthly: true,
        quarterly: true,
        annual: true,
      },
    },
    {
      name: 'AI Tutor access',
      values: {
        free: false,
        monthly: true,
        quarterly: true,
        annual: true,
      },
    },
    {
      name: 'Advanced analytics',
      values: {
        free: false,
        monthly: true,
        quarterly: true,
        annual: true,
      },
    },
    {
      name: 'Offline mode',
      values: {
        free: false,
        monthly: false,
        quarterly: false,
        annual: true,
      },
    },
    {
      name: 'Premium content',
      values: {
        free: false,
        monthly: false,
        quarterly: false,
        annual: true,
      },
    },
    {
      name: 'Parent dashboard',
      values: {
        free: false,
        monthly: false,
        quarterly: false,
        annual: true,
      },
    },
    {
      name: 'Priority support',
      values: {
        free: false,
        monthly: true,
        quarterly: true,
        annual: true,
      },
    },
  ];

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

  const currentPlanData = currentPlan?.plan_details;
  const renewalDate = currentPlan?.renewal_date || 'March 15, 2026';

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
            onUpgrade={() => { }}
            onCancel={() => { }}
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
