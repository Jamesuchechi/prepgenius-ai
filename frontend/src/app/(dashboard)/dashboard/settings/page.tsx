'use client'

import React, { useState } from 'react'
import { User, Settings, Lock, Bell, Moon, Languages, GraduationCap, Target } from 'lucide-react'
import ProfileSettings from '@/components/settings/ProfileSettings'
import AccountSettings from '@/components/settings/AccountSettings'
import PreferenceSettings from '@/components/settings/PreferenceSettings'
import StudyInfoSettings from '@/components/settings/StudyInfoSettings'

const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account & Security', icon: Lock },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'study', name: 'Study Information', icon: GraduationCap },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />
            case 'account': return <AccountSettings />
            case 'preferences': return <PreferenceSettings />
            case 'study': return <StudyInfoSettings />
            default: return <ProfileSettings />
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-[#001D4D]">Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your account settings and preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold whitespace-nowrap
                                            ${isActive
                                                ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.name}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-sm">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}
