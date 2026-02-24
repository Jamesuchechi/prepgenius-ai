'use client';

import React, { Suspense } from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const PaymentFailureContent: React.FC = () => {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const reason = searchParams.get('reason') || 'Your payment could not be processed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 text-center mb-8">{reason}</p>

        {reference && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Reference Number</p>
            <p className="font-mono text-sm font-semibold text-gray-900 break-all">
              {reference}
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">What can you do?</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Try a different payment method</li>
            <li>• Check your card balance and limit</li>
            <li>• Verify your card details</li>
            <li>• Contact your bank</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-center flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Try Again</span>
          </Link>
          <Link
            href="/support"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Contact Support
          </Link>
          <Link
            href="/dashboard"
            className="block w-full text-blue-600 hover:text-blue-700 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Continue as Free User
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          If you continue to experience issues, please contact our support team at{' '}
          <a href="mailto:support@prepgenius.com" className="text-blue-600 hover:text-blue-700 font-semibold">
            support@prepgenius.com
          </a>
        </p>
      </div>
    </div>
  );
};

const PaymentFailurePage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
};

export default PaymentFailurePage;
