import React from 'react';
import { WifiOff } from 'lucide-react';

export const metadata = {
    title: 'Offline | PrepGenius AI',
};

export default function OfflineFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                <WifiOff size={48} />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-gray-900 mb-4">
                You're Offline
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-sm">
                Please check your internet connection to continue your exam preparation on PrepGenius AI.
            </p>
            <button
                onClick={() => {
                    if (typeof window !== 'undefined') {
                        window.location.reload();
                    }
                }}
                className="px-8 py-3 bg-[var(--orange)] text-white font-bold rounded-xl shadow-lg hover:bg-[#E65100] transition-colors"
            >
                Retry Connection
            </button>
        </div>
    );
}
