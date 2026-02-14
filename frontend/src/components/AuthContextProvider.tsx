'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthContextProviderProps {
    children: React.ReactNode
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {

    const { checkAuth } = useAuthStore()

    // Initialize auth on mount
    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return <>{children}</>
}