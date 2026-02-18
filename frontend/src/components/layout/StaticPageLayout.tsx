'use client'

import React from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface StaticPageProps {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export default function StaticPageLayout({ title, subtitle, children }: StaticPageProps) {
    const { isAuthenticated, isLoading } = useAuthStore()

    // Base content for the static page
    const content = (
        <div className="flex-1">
            <header className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-darker)] py-20 px-8 text-center text-white">
                <div className="max-w-[800px] mx-auto">
                    <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-6">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl text-blue-100/80 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </header>

            <section className="py-20 px-8">
                <div className="max-w-[800px] mx-auto prose prose-lg prose-slate max-w-none">
                    {children}
                </div>
            </section>
        </div>
    )

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    }

    if (isAuthenticated) {
        return (
            <DashboardLayout>
                {content}
            </DashboardLayout>
        )
    }

    return (
        <div className="min-h-screen flex flex-col pt-[80px]">
            <Navbar />
            <main className="flex-1">
                {content}
            </main>
            <Footer />
        </div>
    )
}
