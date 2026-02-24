'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const PaymentSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError('No payment reference found');
        setVerifying(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Authentication required');
          setVerifying(false);
          return;
        }

        const response = await fetch('/api/subscriptions/my-subscription/verify-payment/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Payment verification failed');
        }

        setVerifying(false);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {error ? (
          <>
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 text-center mb-6">{error}</p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Pricing</span>
              </button>
              <Link
                href="/support"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Contact Support
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Your subscription has been activated. You now have access to all premium features.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                {reference}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/subscriptions/management"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                View Subscription
              </Link>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              An invoice has been sent to your email. You can view it in your account.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
