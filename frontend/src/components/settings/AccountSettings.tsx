'use client'

import React, { useState } from 'react'
import { Lock, Mail, ShieldCheck, Save } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { settingsApi } from '@/lib/api/settings'
import { toast } from 'sonner'

export default function AccountSettings() {
    const { user } = useAuthStore()
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const handlePasswordChange = async () => {
        if (passwords.new_password !== passwords.new_password_confirm) {
            toast.error('Passwords do not match')
            return
        }

        setIsSaving(true)
        try {
            await settingsApi.changePassword(passwords)
            toast.success('Password updated successfully!')
            setPasswords({ old_password: '', new_password: '', new_password_confirm: '' })
        } catch (error: any) {
            toast.error(error.response?.data?.old_password?.[0] || 'Failed to update password')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Email Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <Mail className="w-5 h-5" />
                    <h3 className="font-bold">Email Address</h3>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Current Email</p>
                        <p className="font-bold text-gray-900">{user?.email}</p>
                    </div>
                    {user?.is_email_verified && (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            Verified
                        </div>
                    )}
                </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <Lock className="w-5 h-5" />
                    <h3 className="font-bold">Change Password</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Current Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                    className="flex items-center gap-2 px-8 py-3 bg-[#001D4D] text-white rounded-2xl font-bold hover:bg-[#002D7A] transition-all shadow-lg shadow-[#001D4D]/20"
                >
                    <Save className="w-5 h-5" /> Update Password
                </button>
            </div>
        </div>
    )
}
