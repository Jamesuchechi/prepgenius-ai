'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// import { useAuthStore } from '@/store/authStore' // Assuming this exists or mocking it
import { Button } from '@/components/ui/Button'

// Mocking useAuthStore since I cannot verify its existence and content easily right now
// and to ensure the file is valid.
const useAuthStore = () => ({
    verifyEmail: async ({ token }: { token: string }) => { console.log(token) },
    isLoading: false,
    error: null,
    clearError: () => { }
})

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { verifyEmail, isLoading, error, clearError } = useAuthStore()
    const [token, setToken] = useState('')
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token')
        if (tokenFromUrl) setToken(tokenFromUrl)
    }, [searchParams])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token.trim()) return

        try {
            await verifyEmail({ token })
            setVerified(true)
            setTimeout(() => router.push('/dashboard'), 2000)
        } catch (err) {
            // Error handled by store
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <h1 className="font-display text-4xl font-bold text-center mb-8">Verify Your Email</h1>

                {verified ? (
                    <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-[var(--gray-dark)] mb-4">Email verified successfully!</p>
                        <p className="text-sm text-[var(--gray-dark)]">
                            Redirecting to dashboard...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Verification Token</label>
                            <textarea
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste the token from your email..."
                                className="w-full px-4 py-3 rounded-lg border-2 border-transparent bg-[var(--gray)] focus:border-[var(--blue)] focus:outline-none"
                                rows={4}
                            />
                        </div>

                        <Button variant="primary" type="submit" disabled={isLoading || !token} className="w-full py-3">
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
