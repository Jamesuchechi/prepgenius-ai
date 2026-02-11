'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { confirmPasswordReset } from '@/lib/api'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (!token) {
            setError('Invalid reset token')
            return
        }

        setIsLoading(true)

        try {
            await confirmPasswordReset(token, formData.newPassword)
            setIsSuccess(true)
            // Redirect to signin after 2 seconds
            setTimeout(() => {
                router.push('/signin')
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. The link may have expired.')
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
                        Password Reset Successful!
                    </h2>
                    <p className="text-[var(--gray-dark)] mb-6">
                        Your password has been successfully reset. Redirecting you to sign in...
                    </p>
                    <Link
                        href="/signin"
                        className="inline-block w-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-3 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    >
                        Go to Sign In
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
                            Set New Password
                        </h1>
                        <p className="text-[var(--gray-dark)]">
                            Enter your new password below
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
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-[var(--black)] mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors"
                                placeholder="Min. 8 characters"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-4 rounded-xl font-semibold text-lg shadow-[0_4px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
