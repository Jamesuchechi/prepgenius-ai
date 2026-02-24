export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Helper to construct API URLs.
 * Handles cases where the endpoint might or might not have leading/trailing slashes.
 */
export const getApiUrl = (endpoint: string): string => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
};
