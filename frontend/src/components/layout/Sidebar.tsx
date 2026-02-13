'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    BrainCircuit,
    LineChart,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    Settings as SettingsIcon,
    Trophy
} from 'lucide-react'

interface SidebarProps {
    isCollapsed: boolean
    toggleSidebar: () => void
    isMobileOpen: boolean
    closeMobileSidebar: () => void
}

export default function Sidebar({
    isCollapsed,
    toggleSidebar,
    isMobileOpen,
    closeMobileSidebar
}: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout, user } = useAuthStore()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            router.push('/')
        }
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Practice', href: '/practice', icon: BrainCircuit },
        { name: 'Mock Exams', href: '/dashboard/exams', icon: BookOpen },
        { name: 'Quizzes', href: '/dashboard/quiz', icon: BookOpen },
        { name: 'Study Plan', href: '/dashboard/study-plan', icon: GraduationCap },
        { name: 'AI Tutor', href: '/dashboard/ai-tutor', icon: BrainCircuit }, // Using BrainCircuit as placeholder if robot icon not available, or import specific icon
        { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
        { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
                transform transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
                w-72
            `}>
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Logo */}
                    <div className={`p-6 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <Link href="/dashboard" className="flex items-center gap-2 group overflow-hidden">
                            <div className="min-w-[2.5rem] w-10 h-10 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-xl flex items-center justify-center text-xl -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                                🎓
                            </div>
                            {!isCollapsed && (
                                <span className="font-display text-2xl font-extrabold text-[var(--blue)] whitespace-nowrap transition-opacity duration-300">
                                    PrepGenius
                                </span>
                            )}
                        </Link>
                        {/* Desktop Collapse Toggle - Only visible on desktop and when expanded (optional design choice, here putting it in header or separate) */}
                    </div>

                    {/* Toggle Button (Desktop Only) - Absolute positioned to be on the border */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 text-gray-500 hover:text-[var(--blue)] shadow-sm z-50 transition-colors"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {/* User Info */}
                    <div className={`
                         border-b border-gray-200 bg-gradient-to-br from-[var(--blue)]/5 to-[var(--orange)]/5
                         transition-all duration-300 overflow-hidden
                         ${isCollapsed ? 'p-4' : 'p-6'}
                    `}>
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="min-w-[3rem] w-12 h-12 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden">
                                    <h3 className="font-semibold text-[var(--black)] truncate">
                                        {user?.first_name} {user?.last_name}
                                    </h3>
                                    <p className="text-sm text-[var(--gray-dark)] truncate">
                                        {user?.exam_targets?.[0]?.toUpperCase() || 'Student'} {new Date().getFullYear()}
                                    </p>
                                </div>
                            )}
                        </div>


                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
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
                                                    ? 'bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white shadow-lg'
                                                    : 'text-[var(--gray-dark)] hover:bg-gray-100 hover:text-[var(--black)]'
                                                }
                                                ${isCollapsed ? 'justify-center px-2' : ''}
                                            `}
                                            title={isCollapsed ? item.name : undefined}
                                        >
                                            <span className={`text-xl ${isCollapsed ? '' : 'min-w-[1.5rem]'}`}>
                                                {/* Use component if it's a component, otherwise render icon */}
                                                <item.icon className="w-6 h-6" />
                                            </span>
                                            {!isCollapsed && (
                                                <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {item.name}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    {/* Upgrade Banner */}
                    {!isCollapsed && (
                        <div className="p-4 border-t border-gray-200">
                            <div className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-xl p-4 text-white">
                                <h4 className="font-bold mb-2">Upgrade to Pro</h4>
                                <p className="text-sm text-white/90 mb-3">Get unlimited access to all features</p>
                                <button className="w-full bg-white text-[var(--blue)] py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                            title={isCollapsed ? 'Logout' : undefined}
                        >
                            <span className="text-xl"><LogOut className="w-6 h-6" /></span>
                            {!isCollapsed && <span className="font-semibold">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
