'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/api'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await requestPasswordReset(email)
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-[var(--black)] mb-3">
                        Check Your Email
                    </h2>
                    <p className="text-[var(--gray-dark)] mb-6">
                        We've sent a password reset link to <strong>{email}</strong>.
                        Please check your inbox and follow the instructions.
                    </p>
                    <Link
                        href="/signin"
                        className="inline-block w-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-3 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-8 py-12 bg-gray-50">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mb-8 group justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-xl flex items-center justify-center text-2xl -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                        🎓
                    </div>
                    <span className="font-display text-3xl font-extrabold text-[var(--blue)]">PrepGenius</span>
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="font-display text-3xl font-extrabold text-[var(--black)] mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-[var(--gray-dark)]">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors"
                                placeholder="student@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-4 rounded-xl font-semibold text-lg shadow-[0_4px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    {/* Back to Sign In */}
                    <p className="mt-6 text-center text-[var(--gray-dark)]">
                        Remember your password?{' '}
                        <Link
                            href="/signin"
                            className="text-[var(--orange)] hover:text-[var(--orange-dark)] font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
