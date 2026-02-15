'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function SignInPage() {
  const router = useRouter()
  const { login, isLoading, error: authError, clearError, isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  // Redirect if already authenticated and verified
  useEffect(() => {
    const user = useAuthStore.getState().user
    // Only redirect to dashboard if verified. 
    // If unverified, STAY HERE (or show a message), do NOT auto-redirect to verify-email
    if (isAuthenticated && ((user as any)?.is_email_verified || (user as any)?.is_superuser)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Sync auth store error with local error
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    clearError()

    try {
      await login(formData.email, formData.password)

      // Check verification status from store (it should be updated by login)
      const user = useAuthStore.getState().user

      if (user?.is_email_verified || user?.is_superuser) {
        router.push('/dashboard')
      } else {
        // If not verified, NOW we redirect to verify-email
        if (user?.email) {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}`)
        } else {
          router.push('/verify-email')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-xl flex items-center justify-center text-2xl -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              🎓
            </div>
            <span className="font-display text-3xl font-extrabold text-[var(--blue)]">PrepGenius</span>
          </Link>

          {/* Header */}
          <div className="mb-8 animate-[fadeInUp_0.6s_ease-out]">
            <h1 className="font-display text-4xl font-extrabold text-[var(--black)] mb-3">
              Welcome Back!
            </h1>
            <p className="text-[var(--gray-dark)] text-lg">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-[fadeInUp_0.3s_ease-out]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-[fadeInUp_0.6s_ease-out_0.1s_backwards]">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--black)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors duration-300 text-[var(--black)]"
                placeholder="student@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--black)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--orange)] hover:text-[var(--orange-dark)] font-medium transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors duration-300 text-[var(--black)]"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-[var(--orange)] border-gray-300 rounded focus:ring-[var(--orange)] focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[var(--gray-dark)]">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-4 rounded-xl font-semibold text-lg shadow-[0_4px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[var(--gray-dark)]">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* <GoogleLoginButton /> */} {/* Assuming GoogleLoginButton is a component you'd import */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[var(--black)] hover:bg-gray-50 transition-all duration-300 font-medium text-[var(--black)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-[var(--gray-dark)] animate-[fadeInUp_0.6s_ease-out_0.2s_backwards]">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-[var(--orange)] hover:text-[var(--orange-dark)] font-semibold transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[var(--orange)]/20 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="max-w-md animate-[fadeInUp_0.8s_ease-out]">
            <div className="mb-8">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-lg rounded-2xl mb-6">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-4xl font-extrabold mb-4">
              Your Success Story Starts Here
            </h2>
            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Join thousands of students who've improved their exam scores with AI-powered personalized learning.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="font-display text-3xl font-bold mb-1">95%</div>
                <div className="text-sm text-white/80">Pass Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="font-display text-3xl font-bold mb-1">10K+</div>
                <div className="text-sm text-white/80">Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="font-display text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}