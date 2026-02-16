'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { settingsApi } from '@/lib/api/settings';

export function ThemeSync() {
    const { theme, setTheme } = useTheme();
    const { user, isAuthenticated, setUser } = useAuthStore();
    const hasInitialized = useRef(false);

    // Effect 1: Sync global theme changes TO backend
    useEffect(() => {
        const syncTheme = async () => {
            if (!isAuthenticated || !user || !theme) return;

            // Only sync if theme is different from stored preference
            const currentPref = user.preferences?.theme;
            if (currentPref === theme) return;

            try {
                const updatedPreferences = {
                    ...(user.preferences || {}),
                    theme: theme
                };

                const updatedUser = await settingsApi.updateProfile({
                    preferences: updatedPreferences
                });

                if (updatedUser) {
                    setUser(updatedUser);
                    console.log('Theme preference synced to backend:', theme);
                }
            } catch (error) {
                console.error('Failed to sync theme preference:', error);
            }
        };

        // Debounce sync to avoid too many requests
        const timer = setTimeout(syncTheme, 2000);
        return () => clearTimeout(timer);
    }, [theme, isAuthenticated, user, setUser]);

    // Effect 2: Initialize global theme FROM backend on load
    useEffect(() => {
        if (isAuthenticated && user?.preferences?.theme && !hasInitialized.current) {
            const backendTheme = user.preferences.theme;
            if (theme !== backendTheme) {
                setTheme(backendTheme);
                console.log('Theme initialized from backend preference:', backendTheme);
            }
            hasInitialized.current = true;
        }
    }, [isAuthenticated, user?.preferences?.theme, setTheme, theme]);

    return null;
}
