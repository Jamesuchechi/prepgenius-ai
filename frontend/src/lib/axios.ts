import axios, { AxiosInstance, AxiosError } from 'axios'

import { API_BASE_URL } from './api-config'

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Handle token refresh on 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                if (refreshToken) {
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh/`,
                        { refresh: refreshToken }
                    )

                    const { access } = response.data
                    localStorage.setItem('access_token', access)

                    originalRequest.headers.Authorization = `Bearer ${access}`
                    return axiosInstance(originalRequest)
                }
            } catch (err) {
                // Refresh failed, logout user
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/auth/login'
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
