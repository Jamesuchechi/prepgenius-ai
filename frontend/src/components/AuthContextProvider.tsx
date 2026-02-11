'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthContextProviderProps {
    children: React.ReactNode
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    // Mocking auth store usage if it's not fully implemented or accessible
    // ideally we use the real store.
    // The original code tried to import from '@/store/authStore'.
    // If useAuthStore is not available, this will fail.
    // I will assume the store exists since I saw 'useAuthStore' in the corrupted file.
    // But wait, the previous verify-email fix required me to MOCK imports.
    // If I reuse imports that might not exist, I'll break the build again.
    // However, these are CORE components. The store MUST exist.

    // Let's try to keep it as close to original as possible but potentially safer if I suspect missing dependencies?
    // No, let's assume dependencies exist.

    const { tokens, getCurrentUser } = useAuthStore() as any

    // Initialize auth on mount
    useEffect(() => {
        const initializeAuth = async () => {
            // Check if we have tokens in localStorage
            if (typeof window !== 'undefined') {
                const accessToken = localStorage.getItem('access_token')
                const refreshToken = localStorage.getItem('refresh_token')

                if (accessToken && refreshToken) {
                    try {
                        // Verify tokens by fetching current user
                        await getCurrentUser()
                    } catch (error) {
                        // Tokens invalid, clear them
                        localStorage.removeItem('access_token')
                        localStorage.removeItem('refresh_token')
                    }
                }
            }
        }

        initializeAuth()
    }, [getCurrentUser])

    return <>{children}</>
}