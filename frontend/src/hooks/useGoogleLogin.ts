import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function useGoogleLogin() {
    const router = useRouter()
    const { setUser } = useAuthStore()

    const handleGoogleLogin = useCallback(async (credential: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
            const response = await fetch(`${API_URL}/auth/google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credential })
            })

            if (!response.ok) {
                throw new Error('Google login failed')
            }

            const data = await response.json()

            // Store tokens
            localStorage.setItem('access_token', data.tokens.access)
            localStorage.setItem('refresh_token', data.tokens.refresh)
            document.cookie = `token=${data.tokens.access}; path=/; max-age=${60 * 60 * 24 * 7}`

            // Update auth store
            setUser(data.user)

            // Redirect to dashboard
            router.push('/dashboard')
        } catch (error) {
            console.error('Google login error:', error)
            throw error
        }
    }, [router, setUser])

    return { handleGoogleLogin }
}
