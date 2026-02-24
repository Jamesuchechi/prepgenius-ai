import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/api-config'
import { useAuthStore } from '@/store/authStore'

export function useGoogleLogin() {
    const router = useRouter()
    const { setUser } = useAuthStore()

    const handleGoogleLogin = useCallback(async (credential: string) => {
        try {
            const API_URL = API_BASE_URL
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

            // Redirect based on verification status
            if (data.user.is_email_verified || data.user.is_superuser) {
                router.push('/dashboard')
            } else {
                router.push('/verify-email')
            }
        } catch (error) {
            console.error('Google login error:', error)
            throw error
        }
    }, [router, setUser])

    return { handleGoogleLogin }
}
