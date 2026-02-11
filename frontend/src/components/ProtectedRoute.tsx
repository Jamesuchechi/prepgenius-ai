'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
    children: ReactNode
    requiredEmailVerification?: boolean
}

export function ProtectedRoute({
    children,
    requiredEmailVerification = false,
}: ProtectedRouteProps) {
    const router = useRouter()
    // As with AuthContextProvider, assuming useAuthStore exists and has these properties
    const { isAuthenticated, user, isLoading } = useAuthStore() as any

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/auth/login')
                return
            }

            if (requiredEmailVerification && user && !user.is_email_verified) {
                router.push('/auth/verify-email')
                return
            }
        }
    }, [isAuthenticated, isLoading, user, requiredEmailVerification, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--orange)]"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}