'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Camera, Save, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import { settingsApi } from '@/lib/api/settings'
import { toast } from 'sonner'

export default function ProfileSettings() {
    const { user, setUser } = useAuthStore()
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        bio: user?.bio || '',
        phone_number: user?.phone_number || ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const updatedUser = await settingsApi.updateProfile(formData)
            setUser(updatedUser)
            toast.success('Profile updated successfully!')
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Avatar Upload */}
                <div className="relative group">
                    <div className="relative w-32 h-32 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                        {user?.profile_picture ? (
                            <Image src={user.profile_picture} alt="Profile" fill className="object-cover rounded-3xl" />
                        ) : (
                            <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                        )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all text-[var(--blue)]">
                        <Camera className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
                            <input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
                            <input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                        <input
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors"
                            placeholder="+234 ..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors resize-none"
                            placeholder="Tell us a bit about yourself..."
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#001D4D] text-white rounded-2xl font-bold hover:bg-[#002D7A] transition-all shadow-lg shadow-[#001D4D]/20 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
            </div>
        </form>
    )
}
