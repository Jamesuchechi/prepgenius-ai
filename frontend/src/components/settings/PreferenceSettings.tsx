'use client'

import React, { useState, useEffect } from 'react'
import { Moon, Sun, Languages, Bell, Save } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { settingsApi } from '@/lib/api/settings'
import { toast } from 'sonner'

export default function PreferenceSettings() {
    const { user, setUser } = useAuthStore()
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    const [preferences, setPreferences] = useState({
        language: user?.preferences?.language || 'en',
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        pushNotifications: user?.preferences?.pushNotifications ?? true,
        achievementAlerts: user?.preferences?.achievementAlerts ?? true
    })
    const [isSaving, setIsSaving] = useState(false)

    // Sync local state when user preferences change (loaded from backend)
    useEffect(() => {
        if (user?.preferences) {
            setPreferences({
                language: user.preferences.language || 'en',
                emailNotifications: user.preferences.emailNotifications ?? true,
                pushNotifications: user.preferences.pushNotifications ?? true,
                achievementAlerts: user.preferences.achievementAlerts ?? true
            })
        }
    }, [user?.preferences])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const settingsToSave = {
                ...preferences,
                theme: theme
            }
            const updatedUser = await settingsApi.updateProfile({ preferences: settingsToSave } as any)
            setUser(updatedUser)
            toast.success(t('settings.preferences_saved'))
        } catch (error) {
            toast.error(t('settings.preferences_failed'))
        } finally {
            setIsSaving(false)
        }
    }

    const handleLanguageChange = (lang: string) => {
        setPreferences(prev => ({ ...prev, language: lang }))
        // Update store immediately for UI feedback
        if (user) {
            setUser({
                ...user,
                preferences: {
                    ...(user.preferences || {}),
                    language: lang
                }
            })
        }
    }

    const toggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-8">
            {/* Appearance */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <Sun className="w-5 h-5" />
                    <h3 className="font-bold">{t('common.appearance')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                            ${theme === 'light' ? 'border-[var(--orange)] bg-[var(--orange)]/5' : 'border-gray-100 hover:bg-gray-50'}
                        `}
                    >
                        <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[var(--orange)]' : 'text-gray-400'}`} />
                        <span className="text-sm font-bold">{t('settings.light_mode')}</span>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                             ${theme === 'dark' ? 'border-[var(--orange)] bg-[var(--orange)]/5' : 'border-gray-100 hover:bg-gray-50'}
                         `}
                    >
                        <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[var(--orange)]' : 'text-gray-400'}`} />
                        <span className="text-sm font-bold">{t('settings.dark_mode')}</span>
                    </button>
                </div>
            </div>

            {/* Language */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <Languages className="w-5 h-5" />
                    <h3 className="font-bold">{t('settings.system_language')}</h3>
                </div>
                <select
                    value={preferences.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors appearance-none bg-white"
                >
                    <option value="en">English (US)</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                </select>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <Bell className="w-5 h-5" />
                    <h3 className="font-bold">{t('settings.notification_toggles')}</h3>
                </div>
                <div className="space-y-3">
                    {[
                        { id: 'emailNotifications', label: t('settings.email_notif'), desc: t('settings.email_notif_desc') },
                        { id: 'pushNotifications', label: t('settings.push_notif'), desc: t('settings.push_notif_desc') },
                        { id: 'achievementAlerts', label: t('settings.achievement_alerts'), desc: t('settings.achievement_alerts_desc') }
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="font-bold text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => toggle(item.id as any)}
                                className={`w-12 h-6 rounded-full transition-all relative ${preferences[item.id as keyof typeof preferences] ? 'bg-[var(--orange)]' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences[item.id as keyof typeof preferences] ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#001D4D] text-white rounded-2xl font-bold hover:bg-[#002D7A] transition-all shadow-lg shadow-[#001D4D]/20 disabled:opacity-50"
                >
                    {isSaving ? t('common.saving') : <><Save className="w-5 h-5" /> {t('settings.save_preferences')}</>}
                </button>
            </div>
        </div>
    )
}
