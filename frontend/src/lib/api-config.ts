export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || (API_BASE_URL.includes('localhost') ? 'ws://localhost:8000' : API_BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, ''));

/**
 * Helper to construct API URLs.
 * Handles cases where the endpoint might or might not have leading/trailing slashes.
 */
export const getApiUrl = (endpoint: string): string => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
};
