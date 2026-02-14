'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'

interface SubscriptionPlan {
    name: string;
    display_name: string;
    price: number;
}

interface UserSubscription {
    plan_details?: SubscriptionPlan;
    plan?: { display_name?: string };
    status: string;
    next_billing_date?: string;
    expires_at?: string;
}

export default function ProfilePage() {
    const { user } = useAuthStore()
    const router = useRouter()

    // START: Subscription fetching logic
    const [subscription, setSubscription] = useState<UserSubscription | null>(null)
    const [loadingSub, setLoadingSub] = useState(true)

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('access_token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

                if (token) {
                    const response = await fetch(`${apiUrl}/subscriptions/my-subscription/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setSubscription(data);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch subscription:', err);
            } finally {
                setLoadingSub(false);
            }
        };

        fetchSubscription();
    }, [user]);
    // END: Subscription fetching logic

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--orange)] mx-auto mb-4"></div>
                    <p className="text-[var(--gray-dark)]">Loading profile...</p>
                </div>
            </div>
        )
    }

    // Determine current plan name
    const planName = subscription?.plan_details?.display_name ||
        subscription?.plan?.display_name ||
        'Free Tier';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="animate-[fadeInUp_0.6s_ease-out]">
                <h1 className="font-display text-4xl font-extrabold text-[var(--black)] mb-2">
                    My Profile
                </h1>
                <p className="text-lg text-[var(--gray-dark)]">
                    View your account details and subscription status
                </p>
            </div>

            {/* Profile Header Card (Read Only) */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.1s_backwards]">
                {/* Cover Picture Banner */}
                <div className="h-48 bg-gray-100 relative">
                    {user.cover_picture ? (
                        <Image
                            src={user.cover_picture}
                            alt="Cover"
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[var(--blue)]/20 to-[var(--orange)]/20"></div>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
                        {/* Profile Picture */}
                        <div className="relative -mt-12">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center relative">
                                {user.profile_picture ? (
                                    <Image
                                        src={user.profile_picture}
                                        alt={user.first_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] flex items-center justify-center text-white font-bold text-4xl">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </div>
                                )}
                            </div>
                            {user.is_email_verified && (
                                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm shadow-sm border-2 border-white">
                                    ✓
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 mb-2">
                            <h2 className="font-display text-3xl font-bold text-[var(--black)] mb-1">
                                {user.first_name} {user.last_name}
                            </h2>
                            <p className="text-[var(--gray-dark)] mb-2">{user.email}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className={`px-3 py-1 rounded-full ${user.is_email_verified
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {user.is_email_verified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                                </span>
                                <span className="text-[var(--gray-dark)]">
                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="mb-4">
                            <button
                                onClick={() => router.push('/dashboard/profile/edit')}
                                className="px-6 py-3 bg-[var(--orange)] text-white rounded-xl font-semibold hover:bg-[var(--orange-dark)] transition-colors shadow-sm"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Information Grid */}
            <div className="grid md:grid-cols-2 gap-6 animate-[fadeInUp_0.6s_ease-out_0.2s_backwards]">
                {/* Personal Details */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4">
                        Details
                    </h3>
                    <dl className="space-y-4">
                        <div>
                            <dt className="text-sm font-semibold text-[var(--gray-dark)]">Phone Number</dt>
                            <dd className="text-[var(--black)] mt-1">{user.phone_number || 'Not provided'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-[var(--gray-dark)]">Grade Level</dt>
                            <dd className="text-[var(--black)] mt-1 capitalize">{user.grade_level?.replace('_', ' ') || 'Not specified'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-[var(--gray-dark)]">Student Type</dt>
                            <dd className="text-[var(--black)] mt-1 capitalize">{user.student_type}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-[var(--gray-dark)]">Bio</dt>
                            <dd className="text-[var(--black)] mt-1">{user.bio || 'No bio provided'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-[var(--gray-dark)]">Exam Targets</dt>
                            <dd className="flex flex-wrap gap-2 mt-1">
                                {user.exam_targets && user.exam_targets.length > 0 ? (
                                    user.exam_targets.map((exam) => (
                                        <span key={exam} className="px-2 py-1 bg-[var(--blue)]/10 text-[var(--blue)] text-xs rounded-md font-medium">
                                            {exam.toUpperCase()}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[var(--gray-dark)]">None selected</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Subscription & Verification */}
                <div className="space-y-6">
                    {/* Subscription Status */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200">
                        <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4 flex items-center justify-between">
                            <span>Subscription</span>
                            {!loadingSub && (
                                <span className={`text-sm px-3 py-1 rounded-full ${planName === 'Free Tier' ? 'bg-gray-100 text-gray-600' : 'bg-[var(--orange)]/10 text-[var(--orange)]'
                                    }`}>
                                    {planName}
                                </span>
                            )}
                        </h3>

                        {loadingSub ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[var(--gray-dark)]">
                                    Current Plan: <span className="font-semibold text-[var(--black)]">{planName}</span>
                                </p>
                                {subscription?.next_billing_date && (
                                    <p className="text-[var(--gray-dark)]">
                                        Renews on: <span className="font-semibold text-[var(--black)]">
                                            {new Date(subscription.next_billing_date).toLocaleDateString()}
                                        </span>
                                    </p>
                                )}
                                <button
                                    onClick={() => router.push('/dashboard/pricing')}
                                    className="text-[var(--blue)] font-semibold hover:underline text-sm"
                                >
                                    Manage Subscription →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Verification Status */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200">
                        <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4">
                            Verification
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--gray-dark)]">Email Verified</span>
                                <span className={user.is_email_verified ? "text-green-500 font-bold" : "text-yellow-500 font-bold"}>
                                    {user.is_email_verified ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {/* Add other verification types if they exist later (e.g. Phone) */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
