'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    BrainCircuit,
    Settings,
    LogOut,
    LineChart
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore' // Assuming store exists

export default function Sidebar() {
    const pathname = usePathname()
    // Mock logout if store not fully functional in this context
    const logout = () => { localStorage.clear(); window.location.href = '/signin' }

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Practice', href: '/practice', icon: BrainCircuit },
        { name: 'Exams', href: '/dashboard/exams', icon: BookOpen },
        { name: 'Study Plan', href: '/dashboard/study-plan', icon: GraduationCap },
        { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50">
            <div className="p-8">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-xl flex items-center justify-center text-xl -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                        🎓
                    </div>
                    <span className="font-display text-xl font-extrabold text-[var(--blue)]">PrepGenius</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
                    const Icon = link.icon

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
