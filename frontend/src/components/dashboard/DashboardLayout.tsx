'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Practice', href: '/practice', icon: '📝' },
  { name: 'Mock Exams', href: '/dashboard/exams', icon: '⏱️' },
  { name: 'Study Plan', href: '/dashboard/study-plan', icon: '📅' },
  { name: 'AI Tutor', href: '/dashboard/ai-tutor', icon: '🤖' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-xl flex items-center justify-center text-xl -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                🎓
              </div>
              <span className="font-display text-2xl font-extrabold text-[var(--blue)]">PrepGenius</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-[var(--blue)]/5 to-[var(--orange)]/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--black)]">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-sm text-[var(--gray-dark)]">
                  {user?.exam_targets?.[0]?.toUpperCase() || 'Student'} {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Study Streak */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-[var(--orange)]/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[var(--gray-dark)]">Study Streak</span>
                <span className="text-lg">🔥</span>
              </div>
              <div className="font-display text-2xl font-bold text-[var(--orange)]">7 days</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                        ${isActive
                          ? 'bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white shadow-lg scale-105'
                          : 'text-[var(--gray-dark)] hover:bg-gray-100 hover:text-[var(--black)]'
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Upgrade Banner */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-xl p-4 text-white">
              <h4 className="font-bold mb-2">Upgrade to Pro</h4>
              <p className="text-sm text-white/90 mb-3">Get unlimited access to all features</p>
              <button className="w-full bg-white text-[var(--blue)] py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
            >
              <span className="text-xl">🚪</span>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search topics, questions..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[var(--orange)] focus:outline-none transition-colors"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}