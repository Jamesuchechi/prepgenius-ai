'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { updateProfile, changePassword } from '@/lib/api'

export default function ProfilePage() {
    const { user, setUser } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        bio: '',
        exam_targets: [] as string[],
        grade_level: ''
    })

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_number: user.phone_number || '',
                bio: user.bio || '',
                exam_targets: user.exam_targets || [],
                grade_level: user.grade_level || ''
            })
        }
    }, [user])

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const updatedUser = await updateProfile(profileData)
            setUser(updatedUser)
            setIsEditing(false)
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            await changePassword(passwordData.oldPassword, passwordData.newPassword)
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
            setIsChangingPassword(false)
            setMessage({ type: 'success', text: 'Password changed successfully!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' })
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--orange)] mx-auto mb-4"></div>
                    <p className="text-[var(--gray-dark)]">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="animate-[fadeInUp_0.6s_ease-out]">
                <h1 className="font-display text-4xl font-extrabold text-[var(--black)] mb-2">
                    My Profile
                </h1>
                <p className="text-lg text-[var(--gray-dark)]">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-xl border-l-4 animate-[fadeInUp_0.3s_ease-out] ${message.type === 'success'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-red-50 border-red-500 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.1s_backwards]">
                <div className="flex items-start gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-full flex items-center justify-center text-white font-bold text-3xl">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        {user.is_email_verified && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                                ✓
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h2 className="font-display text-2xl font-bold text-[var(--black)] mb-1">
                            {user.first_name} {user.last_name}
                        </h2>
                        <p className="text-[var(--gray-dark)] mb-2">{user.email}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className={`px-3 py-1 rounded-full ${user.is_email_verified
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {user.is_email_verified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                            </span>
                            <span className="text-[var(--gray-dark)]">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Edit Button */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-[var(--orange)] text-white rounded-xl font-semibold hover:bg-[var(--orange-dark)] transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Information Form */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.2s_backwards]">
                <h3 className="font-display text-xl font-bold text-[var(--black)] mb-6">
                    Personal Information
                </h3>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={profileData.first_name}
                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profileData.last_name}
                                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profileData.phone_number}
                                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                                disabled={!isEditing}
                                placeholder="+234 XXX XXX XXXX"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Grade Level */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Grade Level
                            </label>
                            <select
                                value={profileData.grade_level}
                                onChange={(e) => setProfileData({ ...profileData, grade_level: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select grade level</option>
                                <option value="ss1">Senior Secondary 1</option>
                                <option value="ss2">Senior Secondary 2</option>
                                <option value="ss3">Senior Secondary 3</option>
                                <option value="post_secondary">Post-Secondary</option>
                            </select>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                            Bio
                        </label>
                        <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            disabled={!isEditing}
                            rows={4}
                            maxLength={500}
                            placeholder="Tell us about yourself..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                        />
                        <p className="text-sm text-[var(--gray-dark)] mt-1">
                            {profileData.bio.length}/500 characters
                        </p>
                    </div>

                    {/* Exam Targets */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                            Exam Targets
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {user.exam_targets.map((exam) => (
                                <span
                                    key={exam}
                                    className="px-4 py-2 bg-[var(--blue)]/10 text-[var(--blue)] rounded-lg font-medium"
                                >
                                    {exam.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white py-3 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false)
                                    // Reset to original user data
                                    if (user) {
                                        setProfileData({
                                            first_name: user.first_name || '',
                                            last_name: user.last_name || '',
                                            phone_number: user.phone_number || '',
                                            bio: user.bio || '',
                                            exam_targets: user.exam_targets || [],
                                            grade_level: user.grade_level || ''
                                        })
                                    }
                                }}
                                className="px-8 py-3 border-2 border-gray-200 rounded-xl font-semibold text-[var(--black)] hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.3s_backwards]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-display text-xl font-bold text-[var(--black)]">
                            Security
                        </h3>
                        <p className="text-sm text-[var(--gray-dark)] mt-1">
                            Manage your password and security settings
                        </p>
                    </div>
                    {!isChangingPassword && (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="px-6 py-3 bg-[var(--blue)] text-white rounded-xl font-semibold hover:bg-[var(--blue-dark)] transition-colors"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {isChangingPassword && (
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--blue)] focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                minLength={8}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--blue)] focus:outline-none transition-colors"
                            />
                            <p className="text-sm text-[var(--gray-dark)] mt-1">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[var(--black)] mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--blue)] focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] text-white py-3 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangingPassword(false)
                                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                                }}
                                className="px-8 py-3 border-2 border-gray-200 rounded-xl font-semibold text-[var(--black)] hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {!isChangingPassword && user.last_login_date && (
                    <div className="text-sm text-[var(--gray-dark)]">
                        Last login: {new Date(user.last_login_date).toLocaleString()}
                    </div>
                )}
            </div>

            {/* Account Stats */}
            <div className="grid md:grid-cols-3 gap-6 animate-[fadeInUp_0.6s_ease-out_0.4s_backwards]">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="text-sm text-[var(--gray-dark)] mb-1">Account Type</div>
                    <div className="font-display text-2xl font-bold text-[var(--black)] capitalize">
                        {user.student_type}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="text-sm text-[var(--gray-dark)] mb-1">Member Since</div>
                    <div className="font-display text-2xl font-bold text-[var(--black)]">
                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="text-sm text-[var(--gray-dark)] mb-1">Email Status</div>
                    <div className="font-display text-2xl font-bold text-[var(--black)]">
                        {user.is_email_verified ? '✓ Verified' : '⚠ Pending'}
                    </div>
                </div>
            </div>
        </div>
    )
}
