import React from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/layout/Footer'

interface StaticPageProps {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export default function StaticPageLayout({ title, subtitle, children }: StaticPageProps) {
    return (
        <div className="min-h-screen flex flex-col pt-[80px]">
            <Navbar />
            <main className="flex-1">
                <header className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-darker)] py-20 px-8 text-center">
                    <div className="max-w-[800px] mx-auto">
                        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6">
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
            </main>
            <Footer />
        </div>
    )
}
