'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import NotificationDropdown from '@/components/layout/NotificationDropdown'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // Desktop state
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!user.is_email_verified && !user.is_superuser) {
        // This IS a protected route (dashboard), so we MUST redirect unverified users
        // unlike signin/signup where we want to let them stay.
        if (user.email && user.email !== 'undefined') {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}`)
        } else {
          router.push(`/verify-email`)
        }
      }
    } else if (!isLoading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [user, isAuthenticated, isLoading, router])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[51] w-12 h-12 flex items-center justify-center bg-card rounded-xl shadow-lg border border-border group"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-5">
          <span
            className={`absolute left-0 top-0 h-0.5 w-full bg-foreground transition-all duration-300 rounded-full ${isSidebarOpen ? 'rotate-45 top-2' : ''
              }`}
          />
          <span
            className={`absolute left-0 top-2 h-0.5 w-full bg-foreground transition-all duration-300 rounded-full ${isSidebarOpen ? 'opacity-0' : ''
              }`}
          />
          <span
            className={`absolute left-0 top-4 h-0.5 w-full bg-foreground transition-all duration-300 rounded-full ${isSidebarOpen ? '-rotate-45 top-2' : ''
              }`}
          />
        </div>
      </button>

      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={isSidebarOpen}
        closeMobileSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        className={` min-h-screen w-full transition-all duration-300 ease-in-out overflow-x-hidden
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}
      >
        {/* Top Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-20 w-full">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4 max-w-full">
            {/* Search Bar - Hidden on mobile, visible on lg */}
            <div className="hidden sm:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search topics, questions..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-border bg-background rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Mobile Search Icon Placeholder / Spacer */}
            <div className="sm:hidden flex-1" />

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <ThemeToggle />
              <NotificationDropdown />
              <Link
                href="/dashboard/settings"
                className="p-2 hover:bg-muted rounded-lg transition-colors group"
                title="Settings"
              >
                <Settings className="w-6 h-6 text-muted-foreground group-hover:text-secondary" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-full">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}