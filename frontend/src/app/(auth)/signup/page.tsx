'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'

const examTypes = ['JAMB', 'WAEC', 'NECO', 'GCE', 'NABTEB']
const subjects = [
  'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature', 'Commerce', 'Accounting'
]

export default function SignUpPage() {
  const router = useRouter()
  const { signup, isLoading, error: authError, clearError, isAuthenticated } = useAuthStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    examType: '',
    subjects: [] as string[],
    agreeToTerms: false
  })
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Sync auth store error with local error
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.examType || formData.subjects.length === 0) {
      setError('Please select your exam type and at least one subject')
      return
    }
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    setError('')
    clearError()

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''

      // Map exam type to lowercase for backend
      const examTarget = formData.examType.toLowerCase()

      await signup({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: firstName,
        last_name: lastName,
        exam_targets: [examTarget],
        subjects: formData.subjects
      })

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[var(--blue)]/20 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="max-w-md animate-[fadeInUp_0.8s_ease-out]">
            <div className="mb-8">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-lg rounded-2xl mb-6">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-4xl font-extrabold mb-4">
              Start Your Journey to Excellence
            </h2>
            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Create your free account and get instant access to personalized study plans, practice questions, and AI tutoring.
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              {['Unlimited practice questions', 'Personalized study plans', '24/7 AI tutor access', 'Performance analytics'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl p-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-xl flex items-center justify-center text-2xl -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              🎓
            </div>
            <span className="font-display text-3xl font-extrabold text-[var(--blue)]">PrepGenius</span>
          </Link>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <GoogleLoginButton />
          </div>
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[var(--orange)]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[var(--orange)]' : 'bg-gray-200'}`} />
          </div>

          {/* Header */}
          <div className="mb-8 animate-[fadeInUp_0.6s_ease-out]">
            <h1 className="font-display text-4xl font-extrabold text-[var(--black)] mb-3">
              {step === 1 ? 'Create Account' : 'Personalize Your Learning'}
            </h1>
            <p className="text-[var(--gray-dark)] text-lg">
              {step === 1 ? 'Get started with your free account' : 'Select your exam and subjects'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-[fadeInUp_0.3s_ease-out]">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out]">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-[var(--black)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors duration-300 text-[var(--black)]"
                  placeholder="John Doe"
                  required
                />
              </div>

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

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--black)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors duration-300 text-[var(--black)]"
                  placeholder="At least 8 characters"
                  required
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors duration-300 text-[var(--black)]"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-4 rounded-xl font-semibold text-lg shadow-[0_4px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)] transition-all duration-300"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Exam & Subjects */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-[fadeInUp_0.6s_ease-out]">
              <div>
                <label className="block text-sm font-semibold text-[var(--black)] mb-3">
                  Which exam are you preparing for?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {examTypes.map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => setFormData({ ...formData, examType: exam })}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${formData.examType === exam
                        ? 'bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-[var(--black)] hover:bg-gray-200'
                        }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--black)] mb-3">
                  Select your subjects (max 4)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      disabled={formData.subjects.length >= 4 && !formData.subjects.includes(subject)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${formData.subjects.includes(subject)
                        ? 'bg-[var(--blue)] text-white'
                        : 'bg-gray-100 text-[var(--black)] hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-[var(--gray-dark)] mt-2">
                  {formData.subjects.length}/4 subjects selected
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[var(--orange)] border-gray-300 rounded focus:ring-[var(--orange)] focus:ring-2"
                />
                <label htmlFor="terms" className="text-sm text-[var(--gray-dark)]">
                  I agree to PrepGenius's{' '}
                  <Link href="/terms" className="text-[var(--orange)] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[var(--orange)] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-[var(--black)] hover:bg-gray-50 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-4 rounded-xl font-semibold text-lg shadow-[0_4px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <p className="mt-8 text-center text-[var(--gray-dark)]">
            Already have an account?{' '}
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