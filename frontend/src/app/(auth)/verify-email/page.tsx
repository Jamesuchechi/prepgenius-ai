'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { apiCall, resendVerificationEmail } from '@/lib/api'
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, setUser } = useAuthStore()

    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Get email from URL query param or auth store
        const emailParam = searchParams.get('email')

        // Check if emailParam is valid (not null, not empty, not "undefined")
        if (emailParam && emailParam !== 'undefined') {
            setEmail(emailParam)
        } else if (user?.email && user.email !== 'undefined') {
            setEmail(user.email)
        }
    }, [searchParams, user])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await apiCall<{ user: any, detail: string }>('/auth/verify-email/', {
                method: 'POST',
                body: JSON.stringify({ email, token: code })
            })

            setSuccess(true)

            // Update user in store if logged in
            if (user && user.email === email) {
                setUser({ ...user, is_email_verified: true })
            } else {
                // If not logged in or different user, we might want to update the store with the response user
                // But usually verification happens after registration (auto-login)
                // If response.user is provided, use it
                if (response.user) {
                    // We need to be careful not to overwrite tokens if they are not provided here
                    // Verify endpoint returns user, not tokens usually
                    // If we are already logged in, just update user
                    if (useAuthStore.getState().isAuthenticated) {
                        setUser(response.user)
                    }
                }
            }

            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) return

        try {
            await resendVerificationEmail(email)
            alert('A new verification code has been sent to your email.')
        } catch (err: any) {
            alert(err.message || 'Failed to resend code. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-center text-gray-600 mb-8">
                        We've sent a 6-digit code to <br />
                        <span className="font-semibold text-gray-900">{email || 'your email address'}</span>
                    </p>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h3>
                            <p className="text-gray-600">Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Code
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    required
                                    placeholder="123456"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || code.length !== 6}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify Email <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                className="text-blue-600 hover:underline font-medium"
                                onClick={handleResend}
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        Wrong email? <Link href="/signup" className="text-blue-600 hover:underline">Sign up with a different address</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
