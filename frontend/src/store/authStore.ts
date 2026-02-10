import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  profile_picture?: string
  bio?: string
  student_type: string
  grade_level?: string
  exam_targets: string[]
  is_email_verified: boolean
  created_at: string
  last_login_date?: string
}

interface AuthTokens {
  access: string
  refresh: string
}

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

export interface SignupData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  exam_targets: string[]
  subjects?: string[]
}

// Helper functions for token management
const setTokensInStorage = (tokens: AuthTokens) => {
  localStorage.setItem('access_token', tokens.access)
  localStorage.setItem('refresh_token', tokens.refresh)

  // Also set in cookies for middleware
  document.cookie = `token=${tokens.access}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
}

const getTokensFromStorage = (): AuthTokens | null => {
  const access = localStorage.getItem('access_token')
  const refresh = localStorage.getItem('refresh_token')

  if (access && refresh) {
    return { access, refresh }
  }
  return null
}

const clearTokensFromStorage = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

// Helper to extract error message
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error.detail) return error.detail
  if (error.message) return error.message

  // Handle DRF field errors
  if (typeof error === 'object') {
    const messages: string[] = []
    Object.keys(error).forEach(key => {
      const value = error[key]
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`)
      } else if (typeof value === 'string') {
        messages.push(`${key}: ${value}`)
      }
    })
    if (messages.length > 0) return messages.join('\n')
  }

  return 'An unexpected error occurred'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
          const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(getErrorMessage(error))
          }

          const data = await response.json()

          // Store tokens
          setTokensInStorage(data.tokens)

          set({
            user: data.user,
            tokens: data.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'An error occurred during login'
          })
          throw error
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null })

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
          const response = await fetch(`${API_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(getErrorMessage(error))
          }

          const responseData = await response.json()

          // Store tokens
          setTokensInStorage(responseData.tokens)

          set({
            user: responseData.user,
            tokens: responseData.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'An error occurred during registration'
          })
          throw error
        }
      },

      logout: async () => {
        const { tokens } = get()

        try {
          if (tokens?.refresh) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
            await fetch(`${API_URL}/auth/logout/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.access}`
              },
              body: JSON.stringify({ refresh: tokens.refresh })
            })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear tokens regardless of API call success
          clearTokensFromStorage()
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null
          })
        }
      },

      refreshToken: async () => {
        const { tokens } = get()

        if (!tokens?.refresh) {
          throw new Error('No refresh token available')
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
          const response = await fetch(`${API_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: tokens.refresh })
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()
          const newTokens = {
            access: data.access,
            refresh: tokens.refresh
          }

          setTokensInStorage(newTokens)
          set({ tokens: newTokens })
        } catch (error) {
          // If refresh fails, logout user
          await get().logout()
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: async () => {
        const tokens = getTokensFromStorage()

        if (!tokens) {
          set({ isAuthenticated: false, user: null, tokens: null })
          return
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
          const response = await fetch(`${API_URL}/users/me/`, {
            headers: {
              'Authorization': `Bearer ${tokens.access}`
            }
          })

          if (!response.ok) {
            // Try to refresh token
            await get().refreshToken()
            // Retry with new token
            const newTokens = get().tokens
            if (newTokens) {
              const retryResponse = await fetch(`${API_URL}/users/me/`, {
                headers: {
                  'Authorization': `Bearer ${newTokens.access}`
                }
              })

              if (retryResponse.ok) {
                const user = await retryResponse.json()
                set({ user, tokens: newTokens, isAuthenticated: true })
                return
              }
            }
            throw new Error('Authentication failed')
          }

          const user = await response.json()
          set({ user, tokens, isAuthenticated: true })
        } catch (error) {
          clearTokensFromStorage()
          set({ user: null, tokens: null, isAuthenticated: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)