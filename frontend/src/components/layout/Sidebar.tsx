'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
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
    Trophy,
    DollarSign,
    Building2
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
    const { t } = useTranslation()

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
        { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('sidebar.ai_practice'), href: '/practice', icon: BrainCircuit },
        { name: t('sidebar.mock_exams'), href: '/dashboard/exams', icon: BookOpen },
        { name: t('sidebar.quizzes'), href: '/dashboard/quiz', icon: BookOpen },
        { name: t('sidebar.study_plan'), href: '/dashboard/study-plan', icon: GraduationCap },
        { name: t('sidebar.ai_tutor'), href: '/dashboard/ai-tutor', icon: BrainCircuit },
        { name: t('sidebar.analytics'), href: '/dashboard/analytics', icon: LineChart },
        { name: t('sidebar.achievements'), href: '/dashboard/achievements', icon: Trophy },
        { name: t('sidebar.profile'), href: '/dashboard/profile', icon: User },
        { name: t('sidebar.pricing'), href: '/dashboard/pricing', icon: DollarSign },
    ]

    // Add Institution Portal if user is institutional student OR admin OR superuser
    if (user?.student_type === 'institutional' || user?.is_superuser || user?.is_staff) {
        navigation.splice(7, 0, { name: t('sidebar.institution'), href: '/dashboard/institution', icon: Building2 })
    }

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
                fixed top-0 left-0 h-full bg-card border-r border-border z-40
                transform transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
                w-72
            `}>
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Logo */}
                    <div className={`p-6 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
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
                        className="hidden lg:flex absolute -right-3 top-24 bg-card border border-border rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-secondary shadow-sm z-50 transition-colors"
                        title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {/* User Info */}
                    <div className={`
                         border-b border-border bg-muted/30
                         transition-all duration-300 overflow-hidden
                         ${isCollapsed ? 'p-4' : 'p-6'}
                    `}>
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="min-w-[3rem] w-12 h-12 bg-gradient-to-br from-secondary to-secondary/60 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden">
                                    <h3 className="font-semibold text-foreground truncate">
                                        {user?.first_name} {user?.last_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {user?.exam_targets?.[0]?.toUpperCase() || t('sidebar.student')} {new Date().getFullYear()}
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
                                                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

                    {/* Logout */}
                    <div className="p-4 border-t border-border">
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                            title={isCollapsed ? t('sidebar.logout') : undefined}
                        >
                            <span className="text-xl"><LogOut className="w-6 h-6" /></span>
                            {!isCollapsed && <span className="font-semibold">{t('sidebar.logout')}</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
