'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (reference: string) => Promise<void>;
  planName: string;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  planName,
  amount,
}) => {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if coming back from Paystack
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');

    if (reference && isOpen) {
      handleVerifyPayment(reference);
    }
  }, [isOpen]);

  const handleVerifyPayment = async (reference: string) => {
    try {
      setVerifying(true);
      setError(null);
      await onVerify(reference);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment Status</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {verifying ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Verifying your payment...</p>
              <p className="text-sm text-gray-500 mt-2">
                {planName} - ₦{amount.toLocaleString()}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">✗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-2">
                Welcome to {planName}
              </p>
              <p className="text-sm text-gray-500">
                ₦{amount.toLocaleString()} charged
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
